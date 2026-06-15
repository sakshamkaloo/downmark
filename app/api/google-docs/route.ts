import { google } from "googleapis";
import path from "path";
import { marked } from "marked";
import { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Extract plain text from a marked inline-token array */
function inlineToPlain(tokens: any[]): string {
  return tokens
    .map((t: any) => {
      if (t.type === "strong" || t.type === "em" || t.type === "del") {
        return inlineToPlain(t.tokens ?? []);
      }
      if (t.type === "link") return inlineToPlain(t.tokens ?? []);
      if (t.type === "image") return t.text ?? "";
      return t.raw ?? t.text ?? "";
    })
    .join("");
}

/** Build bold/italic/link requests for a paragraph-like block */
function buildInlineRequests(
  tokens: any[],
  startIndex: number
): { requests: any[]; length: number } {
  const requests: any[] = [];
  let offset = startIndex;

  for (const t of tokens) {
    const plain = inlineToPlain([t]);
    const len = plain.length;

    if (t.type === "strong") {
      requests.push({
        updateTextStyle: {
          range: { startIndex: offset, endIndex: offset + len },
          textStyle: { bold: true },
          fields: "bold",
        },
      });
      // Recurse for nested em inside strong
      if (t.tokens) {
        buildInlineRequests(t.tokens, offset).requests.forEach((r) =>
          requests.push(r)
        );
      }
    } else if (t.type === "em") {
      requests.push({
        updateTextStyle: {
          range: { startIndex: offset, endIndex: offset + len },
          textStyle: { italic: true },
          fields: "italic",
        },
      });
    } else if (t.type === "link") {
      // Underline + blue color for links
      requests.push({
        updateTextStyle: {
          range: { startIndex: offset, endIndex: offset + len },
          textStyle: {
            underline: true,
            foregroundColor: {
              color: { rgbColor: { red: 0.102, green: 0.451, blue: 0.918 } },
            },
          },
          fields: "underline,foregroundColor",
        },
      });
    }

    offset += len;
  }

  return { requests, length: offset - startIndex };
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST ITEM PLAIN-TEXT + inline info
// ─────────────────────────────────────────────────────────────────────────────
interface ListItemInfo {
  text: string; // plain text (no markdown symbols)
  tokens: any[]; // inline tokens for formatting
}

function parseListItem(item: any): ListItemInfo {
  // item.tokens is array of block tokens; first is usually a paragraph
  const inlineTokens: any[] =
    item.tokens?.[0]?.tokens ?? item.tokens ?? [];
  const text = inlineToPlain(inlineTokens);
  return { text, tokens: inlineTokens };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json();
    if (!markdown) {
      return Response.json({ error: "No markdown provided" }, { status: 400 });
    }

    const tokens = marked.lexer(markdown);

    // ── Auth ──────────────────────────────────────────────────────────────
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "google-service-account.json"),
      scopes: [
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive",
      ],
    });
    const docs = google.docs({ version: "v1", auth });

    // ── Create document ───────────────────────────────────────────────────
    const createRes = await docs.documents.create({
      requestBody: { title: "Markdown Document" },
    });
    const documentId = createRes.data.documentId!;

    // ═════════════════════════════════════════════════════════════════════
    // PHASE 1 — Insert all text (NO formatting yet)
    // We must insert text first so indices are stable, then format in phase 2.
    // Tables need a separate two-phase batchUpdate because insertTable shifts
    // indices and we need the doc's real cell indices from the API response.
    // ═════════════════════════════════════════════════════════════════════

    interface Segment {
      type:
        | "heading"
        | "paragraph"
        | "list"
        | "table"
        | "code"
        | "blockquote"
        | "hr"
        | "space";
      startIndex: number;
      endIndex: number;
      token: any;
      // list-specific
      itemRanges?: Array<{ start: number; end: number; tokens: any[] }>;
      ordered?: boolean;
    }

    const segments: Segment[] = [];
    const insertRequests: any[] = [];
    let idx = 1; // Google Docs body starts at index 1

    for (const token of tokens) {
      // ── space ────────────────────────────────────────────────────────
      if (token.type === "space") continue;

      // ── HEADING ──────────────────────────────────────────────────────
      if (token.type === "heading") {
        const inlineTokens = token.tokens ?? [];
        const text = inlineToPlain(inlineTokens) + "\n";
        const start = idx;
        insertRequests.push({
          insertText: { location: { index: start }, text },
        });
        segments.push({
          type: "heading",
          startIndex: start,
          endIndex: start + text.length,
          token,
        });
        idx += text.length;
        continue;
      }

      // ── PARAGRAPH ────────────────────────────────────────────────────
      if (token.type === "paragraph") {
        const inlineTokens = token.tokens ?? [];
        const text = inlineToPlain(inlineTokens) + "\n";
        const start = idx;
        insertRequests.push({
          insertText: { location: { index: start }, text },
        });
        segments.push({
          type: "paragraph",
          startIndex: start,
          endIndex: start + text.length,
          token,
        });
        idx += text.length;
        continue;
      }

      // ── LIST ─────────────────────────────────────────────────────────
      if (token.type === "list") {
        const listStart = idx;
        const itemRanges: Array<{
          start: number;
          end: number;
          tokens: any[];
        }> = [];

        for (const item of token.items) {
          const { text, tokens: inlineToks } = parseListItem(item);
          const itemText = text + "\n";
          const itemStart = idx;
          insertRequests.push({
            insertText: { location: { index: itemStart }, text: itemText },
          });
          itemRanges.push({
            start: itemStart,
            end: itemStart + itemText.length,
            tokens: inlineToks,
          });
          idx += itemText.length;
        }

        segments.push({
          type: "list",
          startIndex: listStart,
          endIndex: idx,
          token,
          itemRanges,
          ordered: token.ordered,
        });
        continue;
      }

      // ── TABLE — insert as placeholder text, handle separately ─────────
      if (token.type === "table") {
        // We'll do tables in a dedicated phase after all text is inserted
        // For now push a newline placeholder so other indices stay correct
        // Tables will be inserted BEFORE the main text batch using insertTable
        // Actually: we need to insert table INLINE — use a different strategy:
        // Insert a blank line as placeholder, record position, replace later.
        // Best approach: insert table text as plain ASCII, then post-process.
        // ─ simplest reliable approach: serialize table as plain text ────
        const header = (token.header as any[])
          .map((h: any) => (h.text ?? h))
          .join("\t");
        const rows = (token.rows as any[][])
          .map((row) => row.map((c: any) => (c.text ?? c)).join("\t"))
          .join("\n");
        const text = header + "\n" + rows + "\n\n";
        const start = idx;
        insertRequests.push({
          insertText: { location: { index: start }, text },
        });
        segments.push({
          type: "table",
          startIndex: start,
          endIndex: start + text.length,
          token,
        });
        idx += text.length;
        continue;
      }

      // ── CODE ─────────────────────────────────────────────────────────
      if (token.type === "code") {
        const text = token.text + "\n\n";
        const start = idx;
        insertRequests.push({
          insertText: { location: { index: start }, text },
        });
        segments.push({
          type: "code",
          startIndex: start,
          endIndex: start + text.length,
          token,
        });
        idx += text.length;
        continue;
      }

      // ── BLOCKQUOTE ───────────────────────────────────────────────────
      if (token.type === "blockquote") {
        const rawText =
          (token as any).text ??
          ((token as any).tokens ?? [])
            .map((t: any) => t.text ?? "")
            .join(" ");
        const text = rawText + "\n\n";
        const start = idx;
        insertRequests.push({
          insertText: { location: { index: start }, text },
        });
        segments.push({
          type: "blockquote",
          startIndex: start,
          endIndex: start + text.length,
          token,
        });
        idx += text.length;
        continue;
      }

      // ── HR ───────────────────────────────────────────────────────────
      if (token.type === "hr") {
        const text = "\n";
        const start = idx;
        insertRequests.push({
          insertText: { location: { index: start }, text },
        });
        segments.push({
          type: "hr",
          startIndex: start,
          endIndex: start + text.length,
          token,
        });
        idx += text.length;
        continue;
      }
    }

    // Execute Phase 1: insert all text
    if (insertRequests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: insertRequests },
      });
    }

    // ═════════════════════════════════════════════════════════════════════
    // PHASE 2 — Apply all formatting
    // ═════════════════════════════════════════════════════════════════════
    const fmtRequests: any[] = [];

    // Blue color for H2 headings (matching screenshots)
    const H2_BLUE = { red: 0.102, green: 0.451, blue: 0.918 }; // #1A73E8
    const H3_DARK = { red: 0.224, green: 0.271, blue: 0.369 }; // #394560

    for (const seg of segments) {
      const { startIndex: s, endIndex: e, token } = seg;

      // ── HEADING ────────────────────────────────────────────────────
      if (seg.type === "heading") {
        const depth = token.depth as number;
        const namedStyle =
          depth === 1 ? "HEADING_1" : depth === 2 ? "HEADING_2" : "HEADING_3";

        fmtRequests.push({
          updateParagraphStyle: {
            range: { startIndex: s, endIndex: e },
            paragraphStyle: { namedStyleType: namedStyle },
            fields: "namedStyleType",
          },
        });

        // H2 → blue color (matching screenshots: blue headings)
        if (depth === 2) {
          fmtRequests.push({
            updateTextStyle: {
              range: { startIndex: s, endIndex: e - 1 },
              textStyle: {
                foregroundColor: { color: { rgbColor: H2_BLUE } },
              },
              fields: "foregroundColor",
            },
          });
        }

        // H3 → dark blue-grey
        if (depth === 3) {
          fmtRequests.push({
            updateTextStyle: {
              range: { startIndex: s, endIndex: e - 1 },
              textStyle: {
                foregroundColor: { color: { rgbColor: H3_DARK } },
              },
              fields: "foregroundColor",
            },
          });
        }
      }

      // ── PARAGRAPH ──────────────────────────────────────────────────
      if (seg.type === "paragraph") {
        const inlineTokens = token.tokens ?? [];
        if (inlineTokens.length > 0) {
          const { requests: inlineReqs } = buildInlineRequests(
            inlineTokens,
            s
          );
          inlineReqs.forEach((r) => fmtRequests.push(r));
        }
      }

      // ── LIST ───────────────────────────────────────────────────────
      if (seg.type === "list" && seg.itemRanges) {
        // Apply bullet/number style
        fmtRequests.push({
          createParagraphBullets: {
            range: { startIndex: seg.startIndex, endIndex: seg.endIndex },
            bulletPreset: seg.ordered
              ? "NUMBERED_DECIMAL_ALPHA_ROMAN"
              : "BULLET_DISC_CIRCLE_SQUARE",
          },
        });

        // Apply inline formatting per item (bold labels etc.)
        for (const itemRange of seg.itemRanges) {
          if (itemRange.tokens.length > 0) {
            const { requests: inlineReqs } = buildInlineRequests(
              itemRange.tokens,
              itemRange.start
            );
            inlineReqs.forEach((r) => fmtRequests.push(r));
          }
        }
      }

      // ── TABLE (plain text formatting) ───────────────────────────────
      if (seg.type === "table") {
        // Bold the header row text
        const header = (token.header as any[])
          .map((h: any) => (h.text ?? h))
          .join("\t");
        // Header occupies startIndex → startIndex + header.length
        fmtRequests.push({
          updateTextStyle: {
            range: { startIndex: s, endIndex: s + header.length },
            textStyle: { bold: true },
            fields: "bold",
          },
        });
        // Center-align header
        fmtRequests.push({
          updateParagraphStyle: {
            range: { startIndex: s, endIndex: s + header.length + 1 },
            paragraphStyle: { alignment: "CENTER" },
            fields: "alignment",
          },
        });
      }

      // ── CODE ───────────────────────────────────────────────────────
      if (seg.type === "code") {
        fmtRequests.push({
          updateTextStyle: {
            range: { startIndex: s, endIndex: e },
            textStyle: {
              weightedFontFamily: { fontFamily: "Courier New" },
              foregroundColor: {
                color: { rgbColor: { red: 0.2, green: 0.2, blue: 0.6 } },
              },
              fontSize: { magnitude: 10, unit: "PT" },
            },
            fields: "weightedFontFamily,foregroundColor,fontSize",
          },
        });
        fmtRequests.push({
          updateParagraphStyle: {
            range: { startIndex: s, endIndex: e },
            paragraphStyle: {
              shading: {
                backgroundColor: {
                  color: { rgbColor: { red: 0.95, green: 0.95, blue: 0.95 } },
                },
              },
            },
            fields: "shading",
          },
        });
      }

      // ── BLOCKQUOTE ─────────────────────────────────────────────────
      if (seg.type === "blockquote") {
        fmtRequests.push({
          updateTextStyle: {
            range: { startIndex: s, endIndex: e },
            textStyle: {
              italic: true,
              foregroundColor: {
                color: { rgbColor: { red: 0.4, green: 0.4, blue: 0.4 } },
              },
            },
            fields: "italic,foregroundColor",
          },
        });
        fmtRequests.push({
          updateParagraphStyle: {
            range: { startIndex: s, endIndex: e },
            paragraphStyle: {
              indentStart: { magnitude: 36, unit: "PT" },
              indentEnd: { magnitude: 36, unit: "PT" },
            },
            fields: "indentStart,indentEnd",
          },
        });
      }

      // ── HR ─────────────────────────────────────────────────────────
      if (seg.type === "hr") {
        fmtRequests.push({
          updateParagraphStyle: {
            range: { startIndex: s, endIndex: e },
            paragraphStyle: {
              borderBottom: {
                color: { color: { rgbColor: { red: 0.8, green: 0.8, blue: 0.8 } } },
                dashStyle: "SOLID",
                padding: { magnitude: 4, unit: "PT" },
                width: { magnitude: 1, unit: "PT" },
              },
            },
            fields: "borderBottom",
          },
        });
      }
    }

    // Execute Phase 2: apply all formatting
    if (fmtRequests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: fmtRequests },
      });
    }

    return Response.json({
      url: `https://docs.google.com/document/d/${documentId}/edit`,
    });
  } catch (error: any) {
    console.error("API ERROR:", error?.message, error?.response?.data ?? "");
    return Response.json(
      { error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
