"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
        background: "rgba(250,247,242,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? "#e8e2d6" : "transparent"}`,
        transition: "border-color 0.3s",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "#0e0d0b",
          }}
        >
          Rent{" "}
          <em style={{ fontStyle: "italic", fontWeight: 300, color: "#c8984a" }}>
            a
          </em>{" "}
          Studio
        </span>
      </Link>

      {/* Desktop nav */}
      <div
        style={{
          display: "flex",
          gap: 36,
          alignItems: "center",
        }}
        className="hidden md:flex"
      >
        {["#space", "#pricing", "#equipment", "#faq"].map((href) => (
          <a
            key={href}
            href={href}
            style={{
              color: "#0e0d0b",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 400,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "#a87d36")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "#0e0d0b")
            }
          >
            {href === "#space"
              ? "The Space"
              : href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
          </a>
        ))}
        <Link
          href="/booking"
          style={{
            padding: "10px 20px",
            background: "#0e0d0b",
            color: "#faf7f2",
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.02em",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#c8984a")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#0e0d0b")
          }
        >
          Book Now
        </Link>
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden"
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          fontSize: 22,
          cursor: "pointer",
          color: "#0e0d0b",
        }}
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#faf7f2",
            padding: 24,
            borderBottom: "1px solid #e8e2d6",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {[
            { href: "#space", label: "The Space" },
            { href: "#pricing", label: "Pricing" },
            { href: "#equipment", label: "Equipment" },
            { href: "#faq", label: "FAQ" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                color: "#0e0d0b",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 400,
              }}
            >
              {label}
            </a>
          ))}
          <Link
            href="/booking"
            onClick={() => setOpen(false)}
            style={{
              padding: "12px 20px",
              background: "#0e0d0b",
              color: "#faf7f2",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
