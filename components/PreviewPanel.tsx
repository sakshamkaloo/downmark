<<<<<<< HEAD
"use client";

import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

type Props = {
  markdown: string;
};

/**
 * Normalize input before handing it to marked:
 * - Convert \r\n and \r to \n (Windows line endings can break block
 *   parsing in some cases)
 * - Strip non-breaking spaces / zero-width characters that often come
 *   from copy-pasting out of Google Docs, Word, or rich-text sources —
 *   these can look like blank lines but aren't recognized by marked as
 *   paragraph separators, which collapses headings/paragraphs together.
 */
function normalizeMarkdown(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

export default function PreviewPanel({ markdown }: Props) {
  const cleaned = normalizeMarkdown(markdown);
  const html = marked.parse(cleaned, { async: false }) as string;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#fff",
        minHeight: "500px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
        <span
          style={{
            marginLeft: 10,
            fontSize: "13px",
            fontWeight: 600,
            color: "#6b7280",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "0.3px",
          }}
        >
          Preview
        </span>
      </div>

      {/* Content — styling from globals.css (.preview-content) */}
      <div style={{ padding: "28px 32px", overflow: "auto", flex: 1 }}>
        <div
             className="markdown-body"
            dangerouslySetInnerHTML={{ __html: html }}
            />
      </div>
    </div>
  );
}

=======
"use client";

import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

type Props = {
  markdown: string;
};

/**
 * Normalize input before handing it to marked:
 * - Convert \r\n and \r to \n (Windows line endings can break block
 *   parsing in some cases)
 * - Strip non-breaking spaces / zero-width characters that often come
 *   from copy-pasting out of Google Docs, Word, or rich-text sources —
 *   these can look like blank lines but aren't recognized by marked as
 *   paragraph separators, which collapses headings/paragraphs together.
 */
function normalizeMarkdown(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

export default function PreviewPanel({ markdown }: Props) {
  const cleaned = normalizeMarkdown(markdown);
  const html = marked.parse(cleaned, { async: false }) as string;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#fff",
        minHeight: "500px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
        <span
          style={{
            marginLeft: 10,
            fontSize: "13px",
            fontWeight: 600,
            color: "#6b7280",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "0.3px",
          }}
        >
          Preview
        </span>
      </div>

      {/* Content — styling from globals.css (.preview-content) */}
      <div style={{ padding: "28px 32px", overflow: "auto", flex: 1 }}>
        <div
             className="markdown-body"
            dangerouslySetInnerHTML={{ __html: html }}
            />
      </div>
    </div>
  );
}

>>>>>>> a80a3d9a6dbcde1b8989994703b70fca48145266
