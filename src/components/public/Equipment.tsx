const ITEMS = [
  {
    icon: "📷",
    title: "Sony a7sii Camera",
    desc: "Pro mirrorless body",
    price: "R547",
  },
  {
    icon: "🔍",
    title: "Sony Lens",
    desc: "50mm or 18-105mm",
    price: "R447",
  },
  {
    icon: "📝",
    title: "Teleprompter",
    desc: "With tablet",
    price: "R447",
  },
  {
    icon: "🎤",
    title: "Rode Wireless Pro",
    desc: "1 or 2-person clip-on lavs",
    price: "R347",
  },
  {
    icon: "📺",
    title: "Live Preview Monitor",
    desc: "Director's monitor",
    price: "R347",
  },
  {
    icon: "🟩",
    title: "Green Screen Chroma Keyer",
    desc: "Live virtual backgrounds",
    price: "R1,247",
  },
  {
    icon: "🎬",
    title: "Livestream Kit",
    desc: "Multi-cam switcher",
    price: "R947",
  },
  {
    icon: "💡",
    title: "4-Light Studio Kit",
    desc: "2 umbrella + 2 LED",
    price: "R250",
  },
];

export default function Equipment() {
  return (
    <section
      id="equipment"
      style={{
        background: "#fff",
        borderTop: "1px solid #e8e2d6",
        padding: "120px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "20%",
          right: -150,
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, #f3e6cb 0%, transparent 70%)",
          opacity: 0.5,
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
            Equipment Rental
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
            Add only what you need.{" "}
            <em style={{ fontStyle: "italic", color: "#a87d36" }}>
              Per session pricing.
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
            Booked the studio-only rate? Pick and choose the gear that fits
            your shoot. All equipment stays on premises for studio use only.
          </p>
        </div>

        {/* Equipment grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 0,
            borderTop: "1px solid #e8e2d6",
          }}
          className="equipment-grid"
        >
          {ITEMS.map((item, i) => {
            const isOdd = i % 2 === 0;
            return (
              <div
                key={item.title}
                style={{
                  padding: "32px 0",
                  paddingRight: isOdd ? 28 : 0,
                  paddingLeft: isOdd ? 0 : 28,
                  borderBottom: "1px solid #e8e2d6",
                  borderRight: isOdd ? "1px solid #e8e2d6" : "none",
                  display: "grid",
                  gridTemplateColumns: "56px 1fr auto",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: "1px solid #c8984a",
                    background: "#f3e6cb",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 18,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      marginBottom: 4,
                      lineHeight: 1.3,
                      color: "#0e0d0b",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#8a857a",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 22,
                      fontWeight: 500,
                      color: "#a87d36",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.price}
                  </div>
                  <small
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: 11,
                      color: "#8a857a",
                      display: "block",
                      marginTop: 2,
                      letterSpacing: "0.05em",
                    }}
                  >
                    per session
                  </small>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div
          style={{
            marginTop: 40,
            padding: 28,
            background: "#e8efea",
            borderLeft: "3px solid #2f5f3f",
            fontSize: 14,
            color: "#3a3a34",
            lineHeight: 1.6,
            borderRadius: 4,
          }}
        >
          <strong style={{ color: "#2f5f3f" }}>Important:</strong> This
          equipment is provided exclusively for use within our studio during
          your booked studio rental session. It is not available for external
          hire or removal from the premises.
        </div>
      </div>
    </section>
  );
}
