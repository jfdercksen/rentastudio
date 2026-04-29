const CLIPS = [
  {
    id: 44039,
    label: "Podcast Recording",
    sub: "01 / On Air",
  },
  {
    id: 32467,
    label: "Studio Atmosphere",
    sub: "02 / The Vibe",
  },
  {
    id: 44050,
    label: "Video Production",
    sub: "03 / Camera Ready",
  },
  {
    id: 44076,
    label: "Cinema-Grade Gear",
    sub: "04 / Equipment",
  },
];

export default function VideoReel() {
  return (
    <section
      style={{
        background: "#0e0d0b",
        borderTop: "1px solid #1e1d1a",
        overflow: "hidden",
      }}
    >
      {/* Label strip */}
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "48px 32px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#a87d36",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontWeight: 500,
          }}
        >
          <span
            style={{ width: 28, height: 1, background: "#c8984a", display: "block" }}
          />
          The Studio Experience
        </div>
        <p
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: "clamp(20px, 2.5vw, 30px)",
            fontWeight: 300,
            color: "#faf7f2",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Show up.{" "}
          <em style={{ fontStyle: "italic", color: "#a87d36" }}>Hit record.</em>
        </p>
      </div>

      {/* Video grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
        }}
        className="video-reel-grid"
      >
        {CLIPS.map(({ id, label, sub }) => (
          <div
            key={id}
            style={{
              position: "relative",
              aspectRatio: "9/13",
              overflow: "hidden",
              background: "#1a1917",
            }}
          >
            <video
              src={`https://assets.mixkit.co/videos/${id}/${id}-720.mp4`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Gradient overlay */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(14,13,11,0.1) 0%, transparent 35%, rgba(14,13,11,0.75) 100%)",
                zIndex: 1,
              }}
            />

            {/* Label */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px 20px 24px",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#c8984a",
                  marginBottom: 5,
                  fontWeight: 500,
                }}
              >
                {sub}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 17,
                  fontWeight: 400,
                  color: "#faf7f2",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom padding */}
      <div style={{ height: 48 }} />
    </section>
  );
}
