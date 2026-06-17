"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

type DropdownItem = {
  label: string;
  href: string;
  desc?: string;
  badge?: string;
};

type NavItem = {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const navLinks: NavItem[] = [
    { label: "Showcase", href: "/showcase" },
    {
      label: "Features",
      href: "/features",
      dropdown: [
        { label: "Google Docs Integration", desc: "Collaborate on content easily", href: "/use-google-docs-for-blogging/" },
        { label: "Lead Magnets and Conversions", desc: "Build lists and convert faster", href: "/lead-magnets-email-popups-cta/" },
        { label: "Agencies & Whitelabel", desc: "Make Typeflo your own", href: "/agencies-whitelabel/" },
        { label: "API and Headless CMS", desc: "Developers love it too", href: "/api-and-headless-cms/" },
      ],
    },
    { label: "Pricing", href: "/pricing" },
    {
      label: "Resources",
      href: "#",
      dropdown: [
        { label: "Changelog", badge: "New", href: "https://feedback.typeflo.io/announcements" },
        { label: "Our Blog", href: "/blog" },
        { label: "Help Center", href: "/knowledge-base" },
        { label: "Facebook Community", href: "https://www.facebook.com/groups/typeflo" },
      ],
    },
  ];

  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, zIndex: 50, width: "100%" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <img src="https://sample.typeflo.io/wp-content/uploads/2025/07/Component-36-7-3.svg" alt="Typeflo" style={{ height: "32px", width: "auto" }} />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, justifyContent: "center" }}>
          {navLinks.map((item) => (
            <div key={item.label} style={{ position: "relative" }}
              onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link href={item.href} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: 500, color: "#374151", textDecoration: "none", padding: "6px 12px", borderRadius: "8px", whiteSpace: "nowrap", background: activeDropdown === item.label ? "#f9fafb" : "transparent" }}>
                {item.label}
                {item.dropdown && <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: activeDropdown === item.label ? "rotate(180deg)" : "rotate(0deg)" }} />}
              </Link>

              {item.dropdown && activeDropdown === item.label && (
                <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", padding: "8px", minWidth: "240px", zIndex: 100, marginTop: "4px" }}>
                  {item.dropdown.map((sub) => (
                    <Link key={sub.label} href={sub.href} style={{ display: "block", padding: "10px 14px", borderRadius: "8px", textDecoration: "none", color: "#374151" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{sub.label}</span>
                        {sub.badge && <span style={{ fontSize: "10px", fontWeight: 600, color: "#5E6BFF", background: "#eef0ff", padding: "1px 6px", borderRadius: "999px" }}>{sub.badge}</span>}
                      </div>
                      {sub.desc && <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{sub.desc}</div>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <Link href="#" style={{ fontSize: "14px", fontWeight: 500, color: "#374151", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", border: "1px solid #d1d5db", whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >Sign In</Link>
          <Link href="#" style={{ fontSize: "14px", fontWeight: 600, color: "#fff", background: "#5E6BFF", padding: "8px 18px", borderRadius: "8px", textDecoration: "none", whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#4a55e0")}
            onMouseLeave={e => (e.currentTarget.style.background = "#5E6BFF")}
          >Start Free Trial</Link>
        </div>

        <button style={{ display: "none", padding: "8px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer" }} className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ borderTop: "1px solid #f3f4f6", background: "#fff", padding: "16px 24px" }}>
          {navLinks.map((item) => (
            <div key={item.label}>
              {item.dropdown ? (
                <>
                  <button onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", fontSize: "14px", fontWeight: 500, color: "#374151", background: "transparent", border: "none", borderBottom: "1px solid #f9fafb", cursor: "pointer", textAlign: "left" }}>
                    {item.label}
                    <ChevronDown size={14} style={{ transform: mobileExpanded === item.label ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                  {mobileExpanded === item.label && (
                    <div style={{ paddingLeft: "12px", paddingBottom: "4px" }}>
                      {item.dropdown.map((sub) => (
                        <Link key={sub.label} href={sub.href} onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "8px 0", fontSize: "13px", color: "#6b7280", textDecoration: "none", borderBottom: "1px solid #f9fafb" }}>
                          {sub.label} {sub.badge && <span style={{ fontSize: "10px", color: "#5E6BFF" }}>({sub.badge})</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href} onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "10px 0", fontSize: "14px", fontWeight: 500, color: "#374151", textDecoration: "none", borderBottom: "1px solid #f9fafb" }}>
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <div style={{ paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="#" style={{ textAlign: "center", fontSize: "14px", fontWeight: 500, border: "1px solid #d1d5db", padding: "10px", borderRadius: "8px", textDecoration: "none", color: "#374151" }}>Sign In</Link>
            <Link href="#" style={{ textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#fff", background: "#5E6BFF", padding: "10px", borderRadius: "8px", textDecoration: "none" }}>Start Free Trial</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .mobile-menu-btn { display: flex !important; } }
        @media (max-width: 768px) { nav > div > div:nth-child(2), nav > div > div:nth-child(3) { display: none !important; } }
      `}</style>
    </nav>
  );
}

export default Navbar;