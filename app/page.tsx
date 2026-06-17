"use client";

import React, { useState } from "react";
import Hero from "@/components/Hero";
import MarkdownEditor from "@/components/MarkdownEditor";
import PreviewPanel from "@/components/PreviewPanel";
import { generateDocx } from "@/lib/generateDocx";
import CreateGoogleDocButton from "@/components/CreateGoogleDocButton";

const SAMPLE_MARKDOWN = `
# Hostel Management Software Systems For All Types Of Schools and Colleges

## Meta Description

*Learn how hostel management systems have become an essential part for all types of schools and colleges in managing campus hostels and how they solve the traditional challenges in hostel operations with ease.*

## Short Summary

This article dives into why a **hostel management system** is essential for modern education.

## Introduction

Hostel life is said to be a key rewarding phase of a student's academic career, offering a special fusion of independent living, community development, and academic focus.

### Video Reference

https://www.youtube.com/watch?v=gT-qWa9JJsg&list=RDgT-qWa9JJsg&start_radio=1

---

## Old Challenges, Modern Demands: The Transformation of Hostel Management

For students, a hostel is more than just a place to sleep; it's a home, a community, and a big part of their campus experience.

### Traditional Challenges vs Modern Digital Solutions

| Traditional Challenges | Modern Demands & Digital Solutions |
|------------------------|------------------------------------|
| Manual, error-prone process | Centralised real-time data |
| Inefficient communication | Instant notifications and apps |
| Slow complaint handling | Transparent issue tracking |
| Manual visitor logs | Smart access control |
| Manual billing | Automated online payments |
| Lack of insights | Data-driven reporting |
| Difficult scalability | Multi-campus management |

---

## Why Digitising Campus Hostels Is Essential

Digital transformation in residential life is now a strategic necessity rather than a luxury.

> Institutions can no longer afford to rely on outdated systems.

---

## Key Benefits of Hostel Management Software Systems

### For Students

- Enhanced Experience
- Feeling Heard
- Convenience
- Improved Safety & Well-being
- Better Living Environment

### For Hostel Administrators & Staff

1. Centralised Operations
2. Increased Efficiency & Time Savings
3. Data-Driven Insights
4. Enhanced Accountability
5. Better Communication
6. Reduced Stress

### For Institutions

- Improved Reputation & Brand Image
- Optimised Resource Utilisation
- Compliance & Reporting
- Scalability

---

## Benefits Summary Table

| Stakeholder | Key Benefits |
|------------|-------------|
| Students | Enhanced Experience, Safety, Convenience |
| Administrators | Centralised Operations, Analytics |
| Institutions | Reputation, Compliance, Scalability |

---

## Essential Features Of An Ideal Hostel Management System

### Student & Room Management

An ideal system streamlines the entire experience of students living in the hostel.

### Attendance & Leave Management

- Automated attendance tracking
- QR code attendance
- Biometric support
- Digital leave workflow

### Fee & Billing Operations

- Automated invoicing
- Online payments
- Payment reminders
- Receipt generation

### Responsive Complaint & Grievance Handling

Students can:

- Submit complaints
- Track complaint status
- Communicate with staff

### Integrated Mess & Cafeteria Management

1. Meal plan enrollment
2. Consumption tracking
3. Inventory management
4. Menu scheduling
5. Student feedback collection

---

## Advanced Security & Maintenance

**Security Features**

- Smart Locks
- RFID Access
- CCTV Integration
- Visitor Management

**Maintenance Features**

- Ticket Management
- Repair Tracking
- Issue Escalation

---

## How To Choose The Best Hostel Management Software

### Checklist

- Assess your institution's needs
- Prioritise key features
- Evaluate user-friendliness
- Check scalability
- Verify security
- Review customer support
- Analyse ROI

---

## Testimonial

> "SpaceBasic has made managing hostels effortless with technology."

**Elanchezhiyan Ganesan**  
*Vice President of Campus Infrastructure*  
*Manipal Global Academy of BFSI*

---

## Conclusion

**Hostel Management Software** helps institutions streamline operations, improve security, and deliver a better residential experience.

*Digital transformation is the future of campus hostel management.*

---

## Frequently Asked Questions (FAQs)

### Q1: Is SpaceBasic designed to handle campus expansions?

Yes. SpaceBasic supports multi-campus management and seamless scalability.

### Q2: Is SpaceBasic suitable for all types of hostels?

Yes. It supports schools, colleges, universities, and training institutes.

### Q3: Can hostel software manage mess operations?

Yes. It includes meal plans, menu scheduling, inventory tracking, and feedback management.
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
      const response = await fetch("/api/google-docs", {
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