export default function Footer() {
  return (
    <footer
      style={{
        background: "#0e0d0b",
        color: "#faf7f2",
        padding: "80px 0 40px",
        position: "relative",
      }}
    >
      {/* Gold-emerald-terracotta gradient top border */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg, #c8984a 0%, #2f5f3f 50%, #c75a3c 100%)",
        }}
      />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 48,
            paddingBottom: 60,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 36,
                fontWeight: 300,
                letterSpacing: "-0.02em",
                marginBottom: 16,
                lineHeight: 1.1,
              }}
            >
              Rent{" "}
              <em style={{ fontStyle: "italic", color: "#c8984a" }}>a</em>{" "}
              Studio
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.55)",
                maxWidth: 300,
                lineHeight: 1.6,
              }}
            >
              A fully equipped content studio in Kyalami Estates, Johannesburg.
              Just show up and shoot.
            </p>
          </div>

          {/* Studio column */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#c8984a",
                marginBottom: 20,
                fontWeight: 500,
              }}
            >
              Studio
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { href: "#space", label: "The Space" },
                { href: "#pricing", label: "Pricing" },
                { href: "#equipment", label: "Equipment" },
                { href: "#faq", label: "FAQ" },
              ].map(({ href, label }) => (
                <li key={href} style={{ marginBottom: 12 }}>
                  <a
                    href={href}
                    style={{
                      color: "#faf7f2",
                      textDecoration: "none",
                      fontSize: 14,
                      opacity: 0.85,
                      transition: "all 0.2s",
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours column */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#c8984a",
                marginBottom: 20,
                fontWeight: 500,
              }}
            >
              Hours
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Monday – Friday",
                "Saturday",
                "Sunday",
                "07:00 – 21:00",
              ].map((line) => (
                <li
                  key={line}
                  style={{
                    marginBottom: 12,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#c8984a",
                marginBottom: 20,
                fontWeight: 500,
              }}
            >
              Contact
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { href: "tel:0829902219", label: "082 990 2219" },
                {
                  href: "mailto:bookings@kyalamistudio.co.za",
                  label: "bookings@kyalamistudio.co.za",
                },
                {
                  href: "#",
                  label: "Kyalami Estates, Johannesburg",
                },
              ].map(({ href, label }) => (
                <li key={label} style={{ marginBottom: 12 }}>
                  <a
                    href={href}
                    style={{
                      color: "#faf7f2",
                      textDecoration: "none",
                      fontSize: 14,
                      opacity: 0.85,
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.45)",
            textTransform: "uppercase",
          }}
        >
          <span>© {new Date().getFullYear()} Kyalami Studio</span>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a
              href="/privacy"
              style={{
                color: "rgba(255,255,255,0.45)",
                textDecoration: "none",
              }}
            >
              Privacy Policy
            </a>
            <span style={{ opacity: 0.3 }}>·</span>
            <a
              href="/terms"
              style={{
                color: "rgba(255,255,255,0.45)",
                textDecoration: "none",
              }}
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
