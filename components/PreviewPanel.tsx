"use client";

import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

type Props = {
  markdown: string;
};

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

      <div style={{ padding: "28px 32px", overflow: "auto", flex: 1 }}>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <style>{`
        .markdown-body {
          font-family: Inter, system-ui, -apple-system, sans-serif;
          font-size: 15px;
          line-height: 1.7;
          color: #1f2937;
        }

        .markdown-body > *:first-child {
          margin-top: 0 !important;
        }

        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
          font-weight: 700;
          line-height: 1.3;
          margin-top: 1.4em;
          margin-bottom: 0.6em;
        }

        .markdown-body h1 {
          font-size: 28px;
          color: #111827;
          padding-bottom: 0.35em;
          border-bottom: 2px solid #e5e7eb;
        }

        .markdown-body h2 {
          font-size: 22px;
          color: #1d4ed8;
        }

        .markdown-body h3 {
          font-size: 19px;
          color: #1d4ed8;
        }

        .markdown-body h4 {
          font-size: 16px;
          color: #111827;
        }

        .markdown-body h5 {
          font-size: 14px;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .markdown-body h6 {
          font-size: 13px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .markdown-body p {
          margin: 0.8em 0;
        }

        .markdown-body ul,
        .markdown-body ol {
          margin: 0.6em 0;
          padding-left: 1.6em;
        }

        .markdown-body ul ul,
        .markdown-body ol ol,
        .markdown-body ul ol,
        .markdown-body ol ul {
          margin: 0.3em 0;
        }

        .markdown-body li {
          margin: 0.3em 0;
        }

        .markdown-body ul li::marker {
          color: #1d4ed8;
        }

        .markdown-body ol li::marker {
          color: #1d4ed8;
          font-weight: 600;
        }

        .markdown-body table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
          font-size: 14px;
        }

        .markdown-body th,
        .markdown-body td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
        }

        .markdown-body thead th {
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }

        .markdown-body tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .markdown-body blockquote {
          margin: 1em 0;
          padding: 0.4em 1em;
          border-left: 3px solid #1d4ed8;
          color: #4b5563;
          font-style: italic;
          background: #f8fafc;
        }

        .markdown-body code {
          background: #f3f4f6;
          color: #dc2626;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
          font-family: "SFMono-Regular", Consolas, Menlo, monospace;
        }

        .markdown-body pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 14px 16px;
          border-radius: 8px;
          overflow: auto;
          margin: 1em 0;
        }

        .markdown-body pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        .markdown-body a {
          color: #2563eb;
          text-decoration: underline;
          text-decoration-color: rgba(37, 99, 235, 0.35);
        }

        .markdown-body a:hover {
          text-decoration-color: #2563eb;
        }

        .markdown-body strong {
          font-weight: 700;
          color: #111827;
        }

        .markdown-body em {
          font-style: italic;
        }

        .markdown-body hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1.6em 0;
        }

        .markdown-body img {
          max-width: 100%;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
