import { google } from "googleapis";
import path from "path";
import { marked } from "marked";
import { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function inlineToPlain(tokens: any[]): string {
  return tokens
    .map((t: any) => {
      if (t.type === "strong" || t.type === "em" || t.type === "del")
        return inlineToPlain(t.tokens ?? []);
      if (t.type === "link") return inlineToPlain(t.tokens ?? []);
      if (t.type === "image") return t.text ?? "";
      return t.raw ?? t.text ?? "";
    })
    .join("");
}

function buildInlineRequests(tokens: any[], startIndex: number): any[] {
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
      if (t.tokens)
        buildInlineRequests(t.tokens, offset).forEach((r) => requests.push(r));
    } else if (t.type === "em") {
      requests.push({
        updateTextStyle: {
          range: { startIndex: offset, endIndex: offset + len },
          textStyle: { italic: true },
          fields: "italic",
        },
      });
    } else if (t.type === "link") {
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
  return requests;
}

function parseListItem(item: any): { text: string; tokens: any[] } {
  const inlineTokens: any[] = item.tokens?.[0]?.tokens ?? item.tokens ?? [];
  return { text: inlineToPlain(inlineTokens), tokens: inlineTokens };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json();
    if (!markdown)
      return Response.json({ error: "No markdown provided" }, { status: 400 });

    const tokens = marked.lexer(markdown);

    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "google-service-account.json"),
      scopes: [
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive",
      ],
    });
    const client = await auth.getClient();
       console.log("AUTH SUCCESS");
    const drive = google.drive({
  version: "v3",
  auth,
});

console.log("TESTING DRIVE ACCESS...");

const about = await drive.about.get({
  fields: "*",
});

console.log("DRIVE ACCESS OK");
console.log(JSON.stringify(about.data, null, 2));

return Response.json({
  success: true,
});
        

     console.log("DOC CREATED:", createRes.data.documentId);
   
    const documentId = createRes.data.documentId!;

    // =========================================================================
    // ARCHITECTURE
    // =========================================================================
    // Phase 1 — Insert all text. Tables get a 1-char "\n" placeholder so
    //           subsequent segment indices stay correct.
    // Phase 2 — Apply all NON-TABLE formatting (headings H1-H6, bullets,
    //           ordered lists, bold/italic/links, code, blockquote, hr).
    //           Must happen BEFORE table insertion because insertTable shifts
    //           every index after the insertion point.
    // Phase 3 — Insert real Google Docs tables in REVERSE order (so earlier
    //           placeholder indices are not disturbed). For each table:
    //             a) insertTable at placeholder index
    //             b) fetch doc, find table, fill cells (reverse order)
    //             c) bold + grey-bg header row
    //             d) delete the now-empty placeholder paragraph
    // =========================================================================

    interface Segment {
      type: "heading" | "paragraph" | "list" | "table" | "code" | "blockquote" | "hr";
      startIndex: number;
      endIndex: number;
      token: any;
      itemRanges?: Array<{ start: number; end: number; tokens: any[] }>;
      ordered?: boolean;
    }

    interface TableInfo {
      placeholderIndex: number;
      numRows: number;
      numCols: number;
      headerCells: string[];
      bodyRows: string[][];
    }

    const segments: Segment[] = [];
    const insertRequests: any[] = [];
    const tables: TableInfo[] = [];
    let idx = 1;

    for (const token of tokens) {
      if (token.type === "space") continue;

      // ── HEADING H1–H6 ────────────────────────────────────────────────
      if (token.type === "heading") {
        const text = inlineToPlain(token.tokens ?? []) + "\n";
        const start = idx;
        insertRequests.push({ insertText: { location: { index: start }, text } });
        segments.push({ type: "heading", startIndex: start, endIndex: start + text.length, token });
        idx += text.length;
        continue;
      }

      // ── PARAGRAPH ────────────────────────────────────────────────────
      if (token.type === "paragraph") {
        const text = inlineToPlain(token.tokens ?? []) + "\n";
        const start = idx;
        insertRequests.push({ insertText: { location: { index: start }, text } });
        segments.push({ type: "paragraph", startIndex: start, endIndex: start + text.length, token });
        idx += text.length;
        continue;
      }

      // ── LIST (bullet + ordered) ───────────────────────────────────────
      if (token.type === "list") {
        const listStart = idx;
        const itemRanges: Array<{ start: number; end: number; tokens: any[] }> = [];

        for (const item of token.items) {
          const { text, tokens: inlineToks } = parseListItem(item);
          const itemText = text + "\n";
          const itemStart = idx;
          insertRequests.push({ insertText: { location: { index: itemStart }, text: itemText } });
          itemRanges.push({ start: itemStart, end: itemStart + itemText.length, tokens: inlineToks });
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

      // ── TABLE — 1-char placeholder ────────────────────────────────────
      if (token.type === "table") {
        const headerCells: string[] = (token.header as any[]).map(
          (h: any) => (typeof h === "string" ? h : h.text ?? "")
        );
        const bodyRows: string[][] = (token.rows as any[][]).map((row) =>
          row.map((c: any) => (typeof c === "string" ? c : c.text ?? ""))
        );

        const start = idx;
        insertRequests.push({ insertText: { location: { index: start }, text: "\n" } });
        segments.push({ type: "table", startIndex: start, endIndex: start + 1, token });
        tables.push({
          placeholderIndex: start,
          numRows: 1 + bodyRows.length,
          numCols: headerCells.length,
          headerCells,
          bodyRows,
        });
        idx += 1;
        continue;
      }

      // ── CODE ─────────────────────────────────────────────────────────
      if (token.type === "code") {
        const text = token.text + "\n\n";
        const start = idx;
        insertRequests.push({ insertText: { location: { index: start }, text } });
        segments.push({ type: "code", startIndex: start, endIndex: start + text.length, token });
        idx += text.length;
        continue;
      }

      // ── BLOCKQUOTE ───────────────────────────────────────────────────
      if (token.type === "blockquote") {
        const rawText =
          (token as any).text ??
          ((token as any).tokens ?? []).map((t: any) => t.text ?? "").join(" ");
        const text = rawText + "\n\n";
        const start = idx;
        insertRequests.push({ insertText: { location: { index: start }, text } });
        segments.push({ type: "blockquote", startIndex: start, endIndex: start + text.length, token });
        idx += text.length;
        continue;
      }

      // ── HR ───────────────────────────────────────────────────────────
      if (token.type === "hr") {
        const start = idx;
        insertRequests.push({ insertText: { location: { index: start }, text: "\n" } });
        segments.push({ type: "hr", startIndex: start, endIndex: start + 1, token });
        idx += 1;
        continue;
      }
    }

    // =========================================================================
    // PHASE 1 — Insert all text
    // =========================================================================
    if (insertRequests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: insertRequests },
      });
    }

    // =========================================================================
    // PHASE 2 — Apply all non-table formatting
    // =========================================================================
    const fmtRequests: any[] = [];

    // Colors matching the screenshots
    const COLORS: Record<number, object> = {
      1: { red: 0.067, green: 0.067, blue: 0.067 }, // H1 near-black
      2: { red: 0.216, green: 0.384, blue: 0.804 }, // H2 blue  #3762CD
      3: { red: 0.224, green: 0.271, blue: 0.369 }, // H3 dark slate #394560
      4: { red: 0.310, green: 0.310, blue: 0.310 }, // H4 dark grey
      5: { red: 0.420, green: 0.420, blue: 0.420 }, // H5 mid grey
      6: { red: 0.520, green: 0.520, blue: 0.520 }, // H6 light grey
    };

    const NAMED_STYLE: Record<number, string> = {
      1: "HEADING_1",
      2: "HEADING_2",
      3: "HEADING_3",
      4: "HEADING_4",
      5: "HEADING_5",
      6: "HEADING_6",
    };

    for (const seg of segments) {
      const { startIndex: s, endIndex: e, token } = seg;

      // ── HEADING ──────────────────────────────────────────────────────
      if (seg.type === "heading") {
        const depth = Math.min(token.depth as number, 6);
        const namedStyle = NAMED_STYLE[depth] ?? "HEADING_3";

        fmtRequests.push({
          updateParagraphStyle: {
            range: { startIndex: s, endIndex: e },
            paragraphStyle: { namedStyleType: namedStyle },
            fields: "namedStyleType",
          },
        });

        const color = COLORS[depth];
        if (color) {
          fmtRequests.push({
            updateTextStyle: {
              range: { startIndex: s, endIndex: e - 1 },
              textStyle: { foregroundColor: { color: { rgbColor: color } } },
              fields: "foregroundColor",
            },
          });
        }
        continue;
      }

      // ── PARAGRAPH ────────────────────────────────────────────────────
      if (seg.type === "paragraph") {
        const inlineTokens = token.tokens ?? [];
        if (inlineTokens.length > 0)
          buildInlineRequests(inlineTokens, s).forEach((r) => fmtRequests.push(r));
        continue;
      }

      // ── LIST ─────────────────────────────────────────────────────────
      if (seg.type === "list" && seg.itemRanges) {
        fmtRequests.push({
          createParagraphBullets: {
            range: { startIndex: seg.startIndex, endIndex: seg.endIndex },
            bulletPreset: seg.ordered
              ? "NUMBERED_DECIMAL_ALPHA_ROMAN"
              : "BULLET_DISC_CIRCLE_SQUARE",
          },
        });

        for (const itemRange of seg.itemRanges) {
          if (itemRange.tokens.length > 0)
            buildInlineRequests(itemRange.tokens, itemRange.start).forEach((r) =>
              fmtRequests.push(r)
            );
        }
        continue;
      }

      // ── CODE ─────────────────────────────────────────────────────────
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
        continue;
      }

      // ── BLOCKQUOTE ───────────────────────────────────────────────────
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
        continue;
      }

      // ── HR ───────────────────────────────────────────────────────────
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
        continue;
      }
    }

    if (fmtRequests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: fmtRequests },
      });
    }

    // =========================================================================
    // PHASE 3 — Insert real Google Docs tables in REVERSE order
    // =========================================================================
    for (let t = tables.length - 1; t >= 0; t--) {
      const { placeholderIndex, numRows, numCols, headerCells, bodyRows } = tables[t];

      // (a) Insert table structure
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              insertTable: {
                rows: numRows,
                columns: numCols,
                location: { index: placeholderIndex },
              },
            },
          ],
        },
      });

      // (b) Fetch doc and find the inserted table
      const snap1 = await docs.documents.get({ documentId });
      const content1 = snap1.data.body!.content!;

      let tableElem: any = null;
      for (const elem of content1) {
        if (
          elem.table &&
          elem.startIndex != null &&
          elem.startIndex >= placeholderIndex - 1 &&
          elem.startIndex <= placeholderIndex + 4
        ) {
          tableElem = elem;
          break;
        }
      }
      // fallback: pick last table
      if (!tableElem) {
        for (const elem of content1) {
          if (elem.table) tableElem = elem;
        }
      }

      if (tableElem) {
        const tableRows: any[] = tableElem.table.tableRows ?? [];
        const cellInserts: any[] = [];
        const cellFmts: any[] = [];

        for (let r = 0; r < tableRows.length; r++) {
          const rowCells: any[] = tableRows[r].tableCells ?? [];
          const isHeader = r === 0;
          const cellTexts = isHeader ? headerCells : (bodyRows[r - 1] ?? []);

          for (let c = 0; c < rowCells.length; c++) {
            const cell = rowCells[c];
            // NOTE: an empty table-cell paragraph occupies exactly one index
            // (its mandatory trailing newline) and that index IS paraStart.
            // Inserting at paraStart + 1 lands past this paragraph's bounds
            // (at the start of the *next* cell, or after the table for the
            // last cell), which either throws "insertion index must be
            // inside the bounds of an existing paragraph" or silently shifts
            // every cell's text into the wrong cell. Insert at paraStart.
            const paraStart: number = cell.content?.[0]?.startIndex ?? 0;
            const text = cellTexts[c] ?? "";

            if (text) {
              cellInserts.push({
                insertText: { location: { index: paraStart }, text },
              });
            }

            if (isHeader) {
              if (text) {
                cellFmts.push({
                  updateTextStyle: {
                    range: {
                      startIndex: paraStart,
                      endIndex: paraStart + text.length,
                    },
                    textStyle: { bold: true },
                    fields: "bold",
                  },
                });
              }
              cellFmts.push({
                updateTableCellStyle: {
                  tableRange: {
                    tableCellLocation: {
                      tableStartLocation: { index: tableElem.startIndex },
                      rowIndex: r,
                      columnIndex: c,
                    },
                    rowSpan: 1,
                    columnSpan: 1,
                  },
                  tableCellStyle: {
                    backgroundColor: {
                      color: { rgbColor: { red: 0.949, green: 0.953, blue: 0.957 } },
                    },
                  },
                  fields: "backgroundColor",
                },
              });
            }
          }
        }

        // Insert cell text in reverse so earlier indices stay valid
        if (cellInserts.length > 0) {
          await docs.documents.batchUpdate({
            documentId,
            requestBody: { requests: [...cellInserts].reverse() },
          });
        }

        // Apply cell formatting
        if (cellFmts.length > 0) {
          await docs.documents.batchUpdate({
            documentId,
            requestBody: { requests: cellFmts },
          });
        }

        // (d) Delete the "\n" placeholder paragraph that now sits after the table
        const snap2 = await docs.documents.get({ documentId });
        const content2 = snap2.data.body!.content!;

        let tblEndIdx: number | null = null;
        for (const elem of content2) {
          if (
            elem.table &&
            elem.startIndex != null &&
            elem.startIndex >= placeholderIndex - 1 &&
            elem.startIndex <= placeholderIndex + 4
          ) {
            tblEndIdx = elem.endIndex!;
            break;
          }
        }

        if (tblEndIdx !== null) {
          const afterElem = content2.find(
            (e) => e.startIndex === tblEndIdx && e.paragraph
          );
          if (afterElem) {
            const paraText = (afterElem.paragraph?.elements ?? [])
              .map((el: any) => el.textRun?.content ?? "")
              .join("");
            if (paraText === "\n" || paraText.trim() === "") {
              await docs.documents.batchUpdate({
                documentId,
                requestBody: {
                  requests: [
                    {
                      deleteContentRange: {
                        range: {
                          startIndex: afterElem.startIndex!,
                          endIndex: afterElem.endIndex!,
                        },
                      },
                    },
                  ],
                },
              });
            }
          }
        }
      }
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
