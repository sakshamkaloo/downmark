import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
      <style>{`
        .footer-link:hover { color: #111827 !important; }
        .footer-btn:hover { background: #f9fafb !important; }
        .footer-btn-dark:hover { background: #374151 !important; }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 1fr 1fr", gap: "48px" }}>

          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Link href="/">
              <img
                src="https://sample.typeflo.io/wp-content/uploads/2025/07/Component-36-7-3.svg"
                alt="Typeflo"
                style={{ height: "32px", width: "auto" }}
              />
            </Link>
            <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.7", margin: 0 }}>
              Modern, stress free blogging platform with built-in SEO, analytics and lead generation tools.
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.7", margin: 0 }}>
              #58, Akshayanagar, Bengaluru,<br />
              KA, India – 560068
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "16px", marginTop: 0 }}>Product</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Roadmap", href: "https://feedback.typeflo.io/roadmap" },
                { label: "Submit an Idea", href: "https://feedback.typeflo.io/" },
                { label: "Product Updates", href: "https://feedback.typeflo.io/announcements" },
                { label: "Pricing", href: "/pricing" },
                { label: "Contact", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="footer-link" style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none" }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "16px", marginTop: 0 }}>Resources</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Blog", href: "/blog" },
                { label: "Help Center", href: "/knowledge-base" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Content API Guide", href: "/knowledge-base/headless-cms-content-api-documentation" },
                { label: "Admin API Guide", href: "/knowledge-base/headless-cms-content-api-documentation" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="footer-link" style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none" }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Let's Connect Column */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "16px", marginTop: 0 }}>Let&apos;s Connect</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              <a href="mailto:hey@typeflo.io" className="footer-link" style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none" }}>
                hey@typeflo.io
              </a>

              <a href="https://twitter.com/typefloHQ" target="_blank" rel="noopener noreferrer" className="footer-btn"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "space-between", gap: "8px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 14px", fontSize: "14px", fontWeight: 500, color: "#111827", textDecoration: "none", background: "#fff", minWidth: "160px" }}
              >
                TypefloHQ
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "16px", height: "16px", flexShrink: 0 }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              <a href="https://www.facebook.com/groups/typeflo" target="_blank" rel="noopener noreferrer" className="footer-btn"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "space-between", gap: "8px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 14px", fontSize: "14px", fontWeight: 500, color: "#111827", textDecoration: "none", background: "#fff", minWidth: "160px" }}
              >
                Join Our Community
                <svg viewBox="0 0 24 24" fill="#1877f2" style={{ width: "16px", height: "16px", flexShrink: 0 }}>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a href="https://cal.com/typeflo/connect-hrithik" target="_blank" rel="noopener noreferrer" className="footer-btn-dark"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "space-between", gap: "8px", borderRadius: "8px", padding: "10px 16px", fontSize: "14px", fontWeight: 600, color: "#fff", textDecoration: "none", background: "#111827", minWidth: "160px" }}
              >
                Schedule Demo
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px", flexShrink: 0 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            Copyright © 2026 Typeflo. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;