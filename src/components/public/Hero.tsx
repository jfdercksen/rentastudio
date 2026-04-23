import Link from "next/link";

export default function Hero() {
  return (
    <section
      style={{
        padding: "180px 32px 120px",
        maxWidth: 1240,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Decorative background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: -40,
          width: "55%",
          height: "100%",
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(47,95,63,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(200,152,74,0.22) 0%, transparent 60%), linear-gradient(135deg, #1a2620 0%, #0e0d0b 100%)",
          opacity: 0.35,
          zIndex: -2,
          pointerEvents: "none",
          maskImage: "linear-gradient(to left, black 30%, transparent 95%)",
          WebkitMaskImage:
            "linear-gradient(to left, black 30%, transparent 95%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 120,
          right: 0,
          width: 520,
          height: 520,
          background:
            "radial-gradient(circle at center, #f3e6cb 0%, transparent 70%)",
          opacity: 0.55,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {/* Eyebrow */}
      <div
        style={{
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          fontSize: 12,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#a87d36",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontWeight: 500,
        }}
      >
        <span
          style={{ width: 28, height: 1, background: "#c8984a", display: "block" }}
        />
        Kyalami Estates · Johannesburg
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: "clamp(44px, 8vw, 104px)",
          fontWeight: 300,
          lineHeight: 0.98,
          letterSpacing: "-0.035em",
          marginBottom: 40,
          maxWidth: 900,
          color: "#0e0d0b",
        }}
      >
        A fully equipped studio.{" "}
        <em style={{ fontStyle: "italic", fontWeight: 300, color: "#a87d36" }}>
          Book &amp; shoot on your own time.
        </em>
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize: 18,
          color: "#3a3a34",
          maxWidth: 580,
          marginBottom: 48,
          lineHeight: 1.6,
        }}
      >
        20 metres of green screen and black screen, camera, lighting,
        microphones and teleprompter — all ready to go. Perfect for YouTubers,
        content creators and corporate videos.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link
          href="/booking"
          style={{
            padding: "16px 32px",
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.02em",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#0e0d0b",
            color: "#faf7f2",
            transition: "all 0.25s",
          }}
        >
          Book the studio →
        </Link>
        <a
          href="#pricing"
          style={{
            padding: "16px 32px",
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.02em",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            background: "transparent",
            color: "#0e0d0b",
            border: "1px solid #0e0d0b",
            transition: "all 0.25s",
          }}
        >
          View pricing
        </a>
      </div>

      {/* Meta stats */}
      <div
        style={{
          display: "flex",
          gap: 48,
          marginTop: 72,
          paddingTop: 32,
          borderTop: "1px solid #d4cbb8",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Location", value: "Kyalami Estates", accent: false },
          { label: "From", value: "R550 / hour", accent: true },
          { label: "Available", value: "7 days a week", accent: false },
          { label: "Call", value: "082 990 2219", accent: false },
        ].map(({ label, value, accent }) => (
          <div key={label}>
            <div
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8a857a",
                marginBottom: 6,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 20,
                fontWeight: 400,
                color: accent ? "#a87d36" : "#0e0d0b",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
