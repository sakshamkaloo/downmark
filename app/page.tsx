"use client";

import React, { useState } from "react";
import Hero from "@/components/Hero";
import MarkdownEditor from "@/components/MarkdownEditor";
import PreviewPanel from "@/components/PreviewPanel";
import { generateDocx } from "@/lib/generateDocx";

export default function Home() {
const [markdown, setMarkdown] = useState(`# Welcome to markdown2

## Live Markdown Preview

Paste markdown on the left side.

| Feature  | Status  |
| -------- | ------- |
| Headings | Working |
| Tables   | Working |
| Lists    | Working |

### Example List

* Markdown Preview
* Google Docs Import
* DOCX Export

console.log("markdown2");

`);

const [loading, setLoading] = useState(false);

async function importGoogleDoc(url: string) {
try {
const docId = url.split("/d/")[1]?.split("/")[0];


  if (!docId) {
    alert("Invalid Google Docs URL");
    return;
  }

  setLoading(true);
  console.log("CALLING API");

  const response = await fetch("/api/google-docs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      docId,
    }),
  });

  const data = await response.json();

console.log("FULL API RESPONSE:", data);

// alert(JSON.stringify(data, null, 2));

if (!data.html) {
  alert("No content returned");
  return;
}

setMarkdown(data.html);

console.log("HTML LENGTH:", data.html.length);
console.log("FIRST 500 CHARS:", data.html.substring(0, 500));

console.log("API RESPONSE:", data);


  console.log("API RESPONSE:", data);

  if (!response.ok) {
    alert(data.error || "Failed to import Google Doc");
    return;
  }

  
} catch (error) {
  console.error("IMPORT ERROR:", error);
  alert("Import failed");
} finally {
  setLoading(false);
}


}

return (
<main
style={{
background: "#fafafa",
minHeight: "100vh",
width: "100%",
}}
> <Hero />


  <section
    style={{
      width: "100%",
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "0 24px 80px",
      boxSizing: "border-box",
    }}
  >
    <input
      type="text"
      placeholder="Paste Google Docs URL and press Enter"
      onKeyDown={async (
        e: React.KeyboardEvent<HTMLInputElement>
      ) => {
        if (e.key !== "Enter") return;

        const url = e.currentTarget.value.trim();

        if (!url) return;

        await importGoogleDoc(url);
      }}
      style={{
        width: "100%",
        padding: "14px",
        marginBottom: "20px",
        borderRadius: "12px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        background: "#fff",
        boxSizing: "border-box",
      }}
    />

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "24px",
      }}
    >
      <button
        onClick={() => generateDocx(markdown)}
        style={{
          background: "#111827",
          color: "#fff",
          border: "none",
          padding: "14px 24px",
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Download .docx
      </button>

      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Importing Google Doc...
        </div>
      )}
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "24px",
        width: "100%",
      }}
    >
      <MarkdownEditor
        markdown={markdown}
        setMarkdown={setMarkdown}
      />

      <PreviewPanel markdown={markdown} />
    </div>
  </section>
</main>


);

}