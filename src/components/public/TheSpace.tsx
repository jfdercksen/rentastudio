import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";

const CARDS = [
  {
    id: 1,
    label: "20m Green & Black Screen",
    sub: "01 / Studio Floor",
    span: 7,
    ratio: "16/10",
    bg: "radial-gradient(ellipse at 50% 40%, rgba(47,95,63,0.4) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(200,152,74,0.18) 0%, transparent 50%), linear-gradient(135deg, #1f3a2b 0%, #0a1812 100%)",
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} stroke="#c8984a" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="14" rx="1" />
        <path d="M2 18l20-14M22 18L2 4" />
      </svg>
    ),
  },
  {
    id: 2,
    label: "Ready to Shoot",
    sub: "02 / The Set",
    span: 5,
    ratio: "16/10",
    bg: "radial-gradient(ellipse at 30% 50%, rgba(200,152,74,0.3) 0%, transparent 55%), linear-gradient(135deg, #2a2520 0%, #0e0b08 100%)",
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} stroke="#c8984a" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    id: 3,
    label: "Rode Pro Mics",
    sub: "03 / Audio",
    span: 4,
    ratio: "1/1",
    bg: "radial-gradient(ellipse at 60% 50%, rgba(199,90,60,0.25) 0%, transparent 55%), linear-gradient(135deg, #2a1f1b 0%, #150e0a 100%)",
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} stroke="#c8984a" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  {
    id: 4,
    label: "Ring + 4-Light Kit",
    sub: "04 / Lighting",
    span: 4,
    ratio: "1/1",
    bg: "radial-gradient(ellipse at 50% 30%, rgba(243,230,203,0.35) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(200,152,74,0.2) 0%, transparent 50%), linear-gradient(180deg, #3a2f1c 0%, #1a1308 100%)",
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} stroke="#c8984a" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21h6M10 21v-4M14 21v-4M7 9a5 5 0 1110 0c0 2-1.5 3.5-2.5 4.5s-1.5 2-1.5 3.5h-2c0-1.5-.5-2.5-1.5-3.5S7 11 7 9z" />
        <path d="M12 2v1M3 9h1M20 9h1M5.2 4.2l.7.7M18.1 4.2l-.7.7" />
      </svg>
    ),
  },
  {
    id: 5,
    label: "Pro Condenser",
    sub: "05 / On Set",
    span: 4,
    ratio: "1/1",
    bg: "radial-gradient(ellipse at 50% 50%, rgba(47,95,63,0.25) 0%, transparent 55%), linear-gradient(135deg, #1a1f22 0%, #0a0e10 100%)",
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} stroke="#c8984a" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4M6 8h12M6 11h8M6 14h10" />
      </svg>
    ),
  },
];

export default async function TheSpace() {
  const supabase = createAdminClient();
  const { data: galleryImages } = await supabase
    .from("gallery_images")
    .select("url, alt_text")
    .order("display_order", { ascending: true })
    .limit(5);

  const images = galleryImages ?? [];

  return (
    <section
      id="space"
      style={{
        background: "#fff",
        borderTop: "1px solid #e8e2d6",
        borderBottom: "1px solid #e8e2d6",
        padding: "120px 0",
      }}
    >
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
            <span style={{ width: 28, height: 1, background: "#c8984a", display: "block" }} />
            The Space
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
            20m of green &amp; black screen.{" "}
            <em style={{ fontStyle: "italic", color: "#a87d36" }}>
              Ready when you are.
            </em>
          </h2>
          <p style={{ marginTop: 20, fontSize: 17, color: "#3a3a34", lineHeight: 1.6 }}>
            A properly kitted-out content studio — 20 metres of professional
            green and black screen, four-light setup, microphones, teleprompter,
            coffee machine and filtered water. Just show up and shoot.
          </p>
        </div>

        {/* Image grid */}
        <div
          className="space-mosaic"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 4,
          }}
        >
          {CARDS.map((card, idx) => {
            const galleryImage = images[idx];
            return (
              <div
                key={card.id}
                style={{
                  gridColumn: `span ${card.span}`,
                  aspectRatio: card.ratio,
                  background: galleryImage ? "#0e0d0b" : card.bg,
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 24,
                }}
              >
                {/* Real photo from gallery */}
                {galleryImage && (
                  <Image
                    src={galleryImage.url}
                    alt={galleryImage.alt_text ?? card.label}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes={card.span >= 7 ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 100vw, 33vw"}
                  />
                )}

                {/* Gradient overlay — always present for text legibility */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, transparent 45%, rgba(14,13,11,0.85))",
                    zIndex: 2,
                  }}
                />

                {/* Icon badge */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 3,
                  }}
                >
                  {card.icon}
                </div>

                {/* Label */}
                <div style={{ position: "relative", zIndex: 4, color: "#fff" }}>
                  <small
                    style={{
                      display: "block",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#c8984a",
                      marginBottom: 6,
                      fontWeight: 500,
                    }}
                  >
                    {card.sub}
                  </small>
                  <span
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 22,
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {card.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
