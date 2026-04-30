import Link from "next/link";

export default function Hero() {
  return (
    <section
      style={{
        padding: "clamp(96px, 14vw, 140px) clamp(20px, 4vw, 32px) clamp(56px, 8vw, 80px)",
        maxWidth: 1240,
        margin: "0 auto",
      }}
    >
      {/* Split grid: text left, video right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "55fr 45fr",
          gap: 64,
          alignItems: "stretch",
          marginBottom: 72,
        }}
        className="hero-grid"
      >
        {/* Left — text */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
              fontSize: "clamp(40px, 5.5vw, 88px)",
              fontWeight: 300,
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
              marginBottom: 36,
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
              fontSize: 17,
              color: "#3a3a34",
              maxWidth: 520,
              marginBottom: 44,
              lineHeight: 1.65,
            }}
          >
            20 metres of green screen and black screen, camera, lighting,
            microphones and teleprompter — all ready to go. Perfect for
            YouTubers, content creators and corporate videos.
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
        </div>

        {/* Right — studio video */}
        <div
          className="hero-video-panel"
          style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            minHeight: 420,
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Gold accent bar */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #c8984a 0%, #a87d36 100%)",
              zIndex: 3,
            }}
          />

          {/* Video */}
          <video
            src="https://assets.mixkit.co/videos/2948/2948-720.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Bottom gradient + label */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 50%, rgba(14,13,11,0.78))",
              display: "flex",
              alignItems: "flex-end",
              padding: "28px",
              zIndex: 2,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#c8984a",
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                Inside the Studio
              </div>
              <div
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 18,
                  fontWeight: 400,
                  color: "#faf7f2",
                  letterSpacing: "-0.01em",
                }}
              >
                Podcast &amp; video production, ready to shoot
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta stats — full width */}
      <div
        style={{
          display: "flex",
          gap: 48,
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
