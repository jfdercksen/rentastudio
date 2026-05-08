"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/content", label: "Content" },
];

interface AdminNavProps {
  userEmail: string | null;
}

export default function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: 240,
        background: "#0e0d0b",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        borderRight: "1px solid #1a1a18",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid #1a1a18",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 18,
            fontWeight: 300,
            color: "#faf7f2",
            letterSpacing: "-0.01em",
          }}
        >
          Kyalami Studio
        </div>
        <div
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#c8984a",
            marginTop: 4,
          }}
        >
          Admin
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV_LINKS.map(({ href, label }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: 6,
                marginBottom: 2,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                color: isActive ? "#c8984a" : "#a09890",
                background: isActive ? "rgba(200,152,74,0.08)" : "transparent",
                transition: "color 0.15s, background 0.15s",
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — user email + sign out */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #1a1a18",
        }}
      >
        {userEmail && (
          <div
            style={{
              fontSize: 11,
              color: "#5a5850",
              marginBottom: 12,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userEmail}
          </div>
        )}
        <button
          onClick={handleSignOut}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "transparent",
            border: "1px solid #2a2a28",
            borderRadius: 6,
            color: "#a09890",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
