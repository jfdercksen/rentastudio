const AMENITIES = [
  {
    title: "Coffee Machine",
    desc: "Freshly brewed espresso, cappuccino or filter — help yourself, on us.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 8h1a4 4 0 110 8h-1" />
        <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    title: "Filtered Water",
    desc: "Chilled, filtered water on tap — crystal clear and always ready.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
    ),
  },
  {
    title: "High-Speed Wi-Fi",
    desc: "Stable fibre — upload rushes or livestream without a hiccup.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12.55a11 11 0 0114.08 0" />
        <path d="M1.42 9a16 16 0 0121.16 0" />
        <path d="M8.53 16.11a6 6 0 016.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    ),
  },
  {
    title: "Secure Parking",
    desc: "Off-street parking inside Kyalami Estates — safe & easy load-in.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Backup Power",
    desc: "Inverter backup keeps your shoot running through load-shedding.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "Flexible Hours",
    desc: "Weekends, evenings, early starts — we work around your schedule.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function Amenities() {
  return (
    <section
      id="amenities"
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
          top: "30%",
          left: -120,
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
            On the House
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
            Complimentary amenities.{" "}
            <em style={{ fontStyle: "italic", color: "#a87d36" }}>
              Included in every booking.
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
            Because good work needs good coffee — and good water. Every studio
            booking includes the essentials to keep you and your crew
            comfortable.
          </p>
        </div>

        {/* Amenity grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px 28px",
          }}
          className="amenity-grid"
        >
          {AMENITIES.map((amenity) => (
            <div
              key={amenity.title}
              style={{
                padding: 28,
                background: "#faf7f2",
                border: "1px solid #e8e2d6",
                borderRadius: 8,
                transition: "all 0.3s",
              }}
              className="amenity-card"
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: "#f3e6cb",
                  color: "#a87d36",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {amenity.icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  marginBottom: 8,
                  color: "#0e0d0b",
                }}
              >
                {amenity.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#3a3a34",
                  lineHeight: 1.5,
                }}
              >
                {amenity.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
