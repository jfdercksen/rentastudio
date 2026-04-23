"use client";

import { useState } from "react";
import Link from "next/link";

type Tier = "studio" | "inclusive";

const STUDIO_WEEKDAY = {
  title: "Weekday Rate · Monday – Thursday",
  cards: [
    {
      label: "— Flexible",
      title: "Hourly",
      duration: "Minimum 1 hour",
      amount: "R550",
      amountSuffix: "/hr",
      per: "Per hour, weekday",
      featured: false,
      badge: null,
      features: [
        "Full studio access",
        "Use of green/black backdrop",
        "Wi-Fi & power",
        "Add equipment à la carte",
      ],
    },
    {
      label: "— Popular",
      title: "Half-Day",
      duration: "4 hours",
      amount: "R2,150",
      amountSuffix: "/4hr",
      per: "Save R50 vs hourly",
      featured: true,
      badge: "Most booked",
      features: [
        "Everything in hourly",
        "4 uninterrupted hours",
        "Priority time slots",
        "Great for short shoots",
      ],
    },
    {
      label: "— Best Value",
      title: "Full Day",
      duration: "8 hours",
      amount: "R4,250",
      amountSuffix: "/8hr",
      per: "Save R150 vs half-day",
      featured: false,
      badge: null,
      features: [
        "Everything in half-day",
        "8 full hours in studio",
        "Flexible start time",
        "Best for full productions",
      ],
    },
  ],
};

const STUDIO_WEEKEND = {
  title: "Weekend Rate · Friday – Sunday",
  cards: [
    {
      label: "— Flexible",
      title: "Hourly",
      duration: "Minimum 1 hour",
      amount: "R750",
      amountSuffix: "/hr",
      per: "Per hour, weekend",
      featured: false,
      badge: null,
      features: [
        "Full studio access",
        "Use of green/black backdrop",
        "Wi-Fi & power",
        "Add equipment à la carte",
      ],
    },
    {
      label: "— Half-Day",
      title: "Half-Day",
      duration: "4 hours",
      amount: "R2,250",
      amountSuffix: "/4hr",
      per: "Save R750 vs hourly",
      featured: false,
      badge: null,
      features: [
        "Everything in hourly",
        "4 uninterrupted hours",
        "Weekend availability",
        "Great for short shoots",
      ],
    },
    {
      label: "— Best Value",
      title: "Full Day",
      duration: "8 hours",
      amount: "R4,350",
      amountSuffix: "/8hr",
      per: "Save R1,650 vs hourly",
      featured: false,
      badge: null,
      features: [
        "Everything in half-day",
        "8 full hours in studio",
        "Flexible start time",
        "Best for full productions",
      ],
    },
  ],
};

const INCLUSIVE_WEEKDAY = {
  title: "Weekday Rate · Monday – Thursday · All Gear Included",
  cards: [
    {
      label: "— All-Inclusive",
      title: "Hourly",
      duration: "Minimum 1 hour",
      amount: "R1,100",
      amountSuffix: "/hr",
      per: "All equipment included",
      featured: false,
      badge: null,
      features: [
        "Sony camera & lens kit",
        "4-light studio setup",
        "Pro microphones",
        "Teleprompter & green screen",
      ],
    },
    {
      label: "— All-Inclusive",
      title: "Half-Day",
      duration: "4 hours",
      amount: "R3,800",
      amountSuffix: "/4hr",
      per: "Save R600 vs hourly",
      featured: true,
      badge: "Popular",
      features: [
        "Everything in hourly",
        "4 uninterrupted hours",
        "All pro gear loaded",
        "Just bring your idea",
      ],
    },
    {
      label: "— Best Value",
      title: "Full Day",
      duration: "8 hours",
      amount: "R5,800",
      amountSuffix: "/8hr",
      per: "Save R3,000 vs hourly",
      featured: false,
      badge: null,
      features: [
        "Everything in half-day",
        "8 full hours in studio",
        "All premium gear included",
        "Full production capable",
      ],
    },
  ],
};

const INCLUSIVE_WEEKEND = {
  title: "Weekend Rate · Friday – Sunday · All Gear Included",
  cards: [
    {
      label: "— All-Inclusive",
      title: "Hourly",
      duration: "Minimum 1 hour",
      amount: "R1,300",
      amountSuffix: "/hr",
      per: "All equipment included",
      featured: false,
      badge: null,
      features: [
        "Sony camera & lens kit",
        "4-light studio setup",
        "Pro microphones",
        "Teleprompter & green screen",
      ],
    },
    {
      label: "— Half-Day",
      title: "Half-Day",
      duration: "4 hours",
      amount: "R4,200",
      amountSuffix: "/4hr",
      per: "Save R1,000 vs hourly",
      featured: false,
      badge: null,
      features: [
        "Everything in hourly",
        "4 uninterrupted hours",
        "All pro gear loaded",
        "Weekend priority",
      ],
    },
    {
      label: "— Best Value",
      title: "Full Day",
      duration: "8 hours",
      amount: "R6,200",
      amountSuffix: "/8hr",
      per: "Save R4,200 vs hourly",
      featured: false,
      badge: null,
      features: [
        "Everything in half-day",
        "8 full hours in studio",
        "All premium gear included",
        "Best for big productions",
      ],
    },
  ],
};

const RATE_GROUPS: Record<Tier, [typeof STUDIO_WEEKDAY, typeof STUDIO_WEEKEND]> = {
  studio: [STUDIO_WEEKDAY, STUDIO_WEEKEND],
  inclusive: [INCLUSIVE_WEEKDAY, INCLUSIVE_WEEKEND],
};

function PriceCard({
  card,
}: {
  card: (typeof STUDIO_WEEKDAY.cards)[0];
}) {
  const bg = card.featured ? "#0e0d0b" : "#fff";
  const color = card.featured ? "#faf7f2" : "#0e0d0b";
  const borderColor = card.featured ? "#0e0d0b" : "#e8e2d6";
  const featureBorder = card.featured
    ? "rgba(255,255,255,0.12)"
    : "#e8e2d6";

  return (
    <div
      style={{
        background: bg,
        color,
        border: `1px solid ${borderColor}`,
        padding: "36px 32px",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s",
      }}
      className="price-card"
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: card.featured ? "#c8984a" : "#e8e2d6",
        }}
        className="price-card-top-border"
      />
      {card.badge && (
        <span
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "#c8984a",
            color: "#0e0d0b",
            padding: "6px 12px",
            borderRadius: 100,
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {card.badge}
        </span>
      )}
      <div
        style={{
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: card.featured ? "#c8984a" : "#a87d36",
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        {card.label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: "-0.02em",
          marginBottom: 6,
        }}
      >
        {card.title}
      </div>
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 28 }}>
        {card.duration}
      </div>
      <div
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 48,
          fontWeight: 300,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {card.amount}
        <small
          style={{
            fontSize: 14,
            opacity: 0.6,
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 400,
          }}
        >
          {card.amountSuffix}
        </small>
      </div>
      <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 28 }}>
        {card.per}
      </div>
      <ul
        style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 28, flexGrow: 1 }}
      >
        {card.features.map((f, i) => (
          <li
            key={i}
            style={{
              padding: "12px 0 12px 22px",
              fontSize: 13,
              borderTop: `1px solid ${featureBorder}`,
              borderBottom:
                i === card.features.length - 1
                  ? `1px solid ${featureBorder}`
                  : "none",
              position: "relative",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                width: 12,
                height: 1,
                background: "#c8984a",
              }}
            />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/booking"
        style={{
          padding: "14px 24px",
          background: card.featured ? "#c8984a" : "#0e0d0b",
          color: card.featured ? "#0e0d0b" : "#faf7f2",
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.02em",
          textDecoration: "none",
          textAlign: "center",
          display: "block",
          transition: "all 0.2s",
        }}
      >
        Book {card.title.toLowerCase()} →
      </Link>
    </div>
  );
}

export default function Pricing() {
  const [tier, setTier] = useState<Tier>("studio");
  const groups = RATE_GROUPS[tier];

  return (
    <section
      id="pricing"
      style={{
        background: "#f5f0e8",
        padding: "120px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "15%",
          left: -100,
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, #e8efea 0%, transparent 70%)",
          opacity: 0.8,
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        {/* Section header */}
        <div style={{ marginBottom: 72, maxWidth: 780 }}>
          <div
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 12,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#a87d36",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 28,
                height: 1,
                background: "#c8984a",
                display: "block",
              }}
            />
            Pricing
          </div>
          <h2
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "#0e0d0b",
            }}
          >
            Two ways to book.{" "}
            <em style={{ fontStyle: "italic", color: "#a87d36" }}>
              Pick what works.
            </em>
          </h2>
          <p
            style={{
              marginTop: 20,
              fontSize: 17,
              color: "#3a3a34",
              lineHeight: 1.6,
            }}
          >
            Studio-only rates if you&apos;re bringing your own gear.
            All-inclusive rates if you want everything loaded and ready.
            Weekday and weekend pricing below.
          </p>
        </div>

        {/* Tier toggle */}
        <div
          style={{
            display: "inline-flex",
            background: "#fff",
            border: "1px solid #e8e2d6",
            borderRadius: 100,
            padding: 4,
            marginBottom: 48,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          {(["studio", "inclusive"] as Tier[]).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              style={{
                padding: "12px 24px",
                background: tier === t ? "#0e0d0b" : "transparent",
                color: tier === t ? "#faf7f2" : "#3a3a34",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.02em",
                borderRadius: 100,
                transition: "all 0.25s",
              }}
            >
              {t === "studio" ? "Studio Only" : "All-Inclusive (with Gear)"}
            </button>
          ))}
        </div>

        {/* Rate groups */}
        {groups.map((group) => (
          <div key={group.title} style={{ marginBottom: 48 }}>
            <div
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 12,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#a87d36",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontWeight: 500,
              }}
            >
              {group.title}
              <span
                style={{ flex: 1, height: 1, background: "#d4cbb8" }}
                aria-hidden
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
              }}
              className="pricing-grid"
            >
              {group.cards.map((card) => (
                <PriceCard key={card.title + card.amount} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
