"use client";

import React, { useState } from "react";
import Hero from "@/components/Hero";
import MarkdownEditor from "@/components/MarkdownEditor";
import PreviewPanel from "@/components/PreviewPanel";
import { generateDocx } from "@/lib/generateDocx";
import CreateGoogleDocButton from "@/components/CreateGoogleDocButton";

const SAMPLE_MARKDOWN = `# Welcome to Markdown → Google Docs

## What this tool does

Paste **any Markdown** on the left and see a live preview on the right. When you're happy, click **Create Google Doc** to export it instantly.

---

## Supported Formatting

### Text Styles

Here's some **bold text**, some *italic text*, and even ~~strikethrough~~.

You can also write \`inline code\` inside a sentence.

### Blockquote

> "The best way to predict the future is to invent it."
> — Alan Kay

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
\`\`\`

---

## Feature Table

| Feature        | Markdown | Google Doc | DOCX |
| -------------- | :------: | :--------: | :--: |
| Headings (H1–H4) | ✅     | ✅         | ✅   |
| Bold & Italic  | ✅       | ✅         | ✅   |
| Tables         | ✅       | ✅         | ✅   |
| Bullet Lists   | ✅       | ✅         | ✅   |
| Ordered Lists  | ✅       | ✅         | ✅   |
| Code Blocks    | ✅       | ✅         | ✅   |
| Blockquotes    | ✅       | ✅         | ✅   |

---

## Getting Started

* Paste your Markdown into the editor on the left
* See the formatted preview update in real time
* Click **Create Google Doc** to export to Google Drive
* Or click **Download .docx** for a local Word file

### Ordered Steps

1. Write or paste Markdown
2. Review the live preview
3. Export with one click

---

## Links & Images

Visit [Google Docs](https://docs.google.com) to manage your documents.
`;

export default function Home() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [loading, setLoading] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  async function createGoogleDoc() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/google-docs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setDocUrl(data.url);
      setShowDialog(true);
    } catch (err) {
     setError(err instanceof Error ? err.message : "Something went wrong");
}
    finally {
      setLoading(false);
    }
  }

  const btnBase: React.CSSProperties = {
    border: "none",
    padding: "13px 28px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "Inter, system-ui, sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "opacity 0.15s, transform 0.1s",
  };

  return (
    <main style={{ background: "#f5f7fa", minHeight: "100vh", width: "100%" }}>
      <Hero />

      <section
          id="converter"
            style={{
           width: "100%",
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 24px 80px",
          boxSizing: "border-box",
        }}
      >
        {/* Action bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => generateDocx(markdown)}
            style={{ ...btnBase, background: "#111827", color: "#fff" }}
          >
            ⬇ Download .docx
          </button>

          <button
            onClick={createGoogleDoc}
            disabled={loading}
            style={{
              ...btnBase,
              background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Creating…
              </>
            ) : (
              <>📄 Create Google Doc</>
            )}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "10px",
              padding: "12px 20px",
              color: "#b91c1c",
              marginBottom: "20px",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>⚠ {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#b91c1c",
                fontSize: "18px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Editor + Preview */}
        <div className="converter-grid">
          <MarkdownEditor markdown={markdown} setMarkdown={setMarkdown} />
          <PreviewPanel markdown={markdown} />
        </div>
      </section>

      {/* Success dialog */}
      {showDialog && docUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDialog(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "40px 44px",
              maxWidth: "420px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            {/* Check icon */}
            <div
              style={{
                width: 64,
                height: 64,
                background: "#dcfce7",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "28px",
              }}
            >
              ✓
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: "22px", color: "#111827", fontWeight: 700 }}>
              Google Doc Created!
            </h2>
            <p style={{ margin: "0 0 28px", color: "#6b7280", fontSize: "15px" }}>
              Your Markdown has been converted and saved to Google Drive.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  background: "#2563eb",
                  color: "#fff",
                  padding: "13px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "15px",
                  textDecoration: "none",
                }}
              >
                Open Google Doc →
              </a>
              <button
                onClick={() => setShowDialog(false)}
                style={{
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  padding: "13px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
         @keyframes spin {
           to {
        transform: rotate(360deg);
    }
  }
`}</style>
    </main>
  );
}
