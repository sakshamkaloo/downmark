"use client";

type Props = {
  markdown: string;
};

export default function PreviewPanel({ markdown }: Props) {
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
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f3f4f6",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        Live Preview
      </div>

      <div
        className="google-doc-preview"
        style={{
          padding: "32px",
          overflowY: "auto",
        }}
        dangerouslySetInnerHTML={{
          __html: markdown,
        }}
      />

      <style>{`
        .google-doc-preview h1{
          font-size:32px;
          font-weight:700;
          margin:24px 0 16px;
        }

        .google-doc-preview h2{
          font-size:28px;
          font-weight:700;
          margin:20px 0 14px;
        }

        .google-doc-preview h3{
          font-size:24px;
          font-weight:700;
          margin:18px 0 12px;
        }

        .google-doc-preview p{
          margin:12px 0;
          line-height:1.8;
        }

        .google-doc-preview ul{
          padding-left:30px;
          margin:12px 0;
          list-style-type:disc;
        }

        .google-doc-preview ol{
          padding-left:30px;
          margin:12px 0;
          list-style-type:decimal;
        }

        .google-doc-preview li{
          display:list-item;
          margin:6px 0;
        }

        .google-doc-preview table{
          width:100%;
          border-collapse:collapse;
          margin:20px 0;
        }

        .google-doc-preview td,
        .google-doc-preview th{
          border:1px solid #d1d5db;
          padding:12px;
        }

        .google-doc-preview img{
          max-width:100%;
          height:auto;
        }
      `}</style>
    </div>
  );
}