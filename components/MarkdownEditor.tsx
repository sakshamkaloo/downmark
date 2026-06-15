<<<<<<< HEAD
"use client";

type Props = {
  markdown: string;
  setMarkdown: (value: string) => void;
};

export default function MarkdownEditor({
  markdown,
  setMarkdown,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#fff",
        minHeight: "500px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f3f4f6",
          fontWeight: 600,
          fontSize: "14px",
          color: "#111827",
        }}
      >
        Markdown Input
      </div>

      {/* Textarea */}
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Paste your markdown here..."
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          resize: "none",
          padding: "20px",
          fontSize: "15px",
          lineHeight: 1.7,
          fontFamily: "monospace",
          color: "#111827",
        }}
      />
    </div>
  );
}


=======
"use client";

type Props = {
  markdown: string;
  setMarkdown: (value: string) => void;
};

export default function MarkdownEditor({
  markdown,
  setMarkdown,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#fff",
        minHeight: "500px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f3f4f6",
          fontWeight: 600,
          fontSize: "14px",
          color: "#111827",
        }}
      >
        Markdown Input
      </div>

      {/* Textarea */}
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Paste your markdown here..."
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          resize: "none",
          padding: "20px",
          fontSize: "15px",
          lineHeight: 1.7,
          fontFamily: "monospace",
          color: "#111827",
        }}
      />
    </div>
  );
}


>>>>>>> a80a3d9a6dbcde1b8989994703b70fca48145266
