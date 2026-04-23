"use client";

import { useState } from "react";

const FAQS = [
  {
    num: "01",
    q: "Where is the studio located?",
    a: "The studio is in Kyalami Estates, Johannesburg. Full address and directions are shared once your booking is confirmed. Secure parking available on site.",
  },
  {
    num: "02",
    q: "What's the difference between Studio Only and All-Inclusive?",
    a: "Studio Only gives you the space — bring your own gear, or add items from the à la carte menu. All-Inclusive loads up the full kit (camera, lights, mics, teleprompter, green screen) so you just show up and shoot.",
  },
  {
    num: "03",
    q: "Why do I need to pay a breakage deposit?",
    a: "The R750 refundable deposit protects the equipment in case of damage or excessive wear during your shoot. It's refunded to your bank account within 48–72 hours after the studio has been inspected (excluding weekends and public holidays).",
  },
  {
    num: "04",
    q: "Can I take equipment off-site?",
    a: "No — all equipment is provided for use within the studio during your booking only. It's not available for external hire or removal from the premises.",
  },
  {
    num: "05",
    q: "What's the cancellation policy?",
    a: "Free reschedule up to 48 hours before your slot. Within 48 hours a 50% fee applies. No-shows are non-refundable.",
  },
  {
    num: "06",
    q: "Is the studio open on weekends?",
    a: "Yes — weekend rates apply Friday through Sunday. See the pricing section for weekend hourly, half-day, and full-day rates.",
  },
  {
    num: "07",
    q: "Can I see the space before booking?",
    a: "Absolutely. Give us a call on 082 990 2219 to arrange a quick walk-through — especially if you've got a bigger production in mind.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section
      id="faq"
      style={{
        background: "#fff",
        borderTop: "1px solid #e8e2d6",
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
            <span
              style={{
                width: 28,
                height: 1,
                background: "#c8984a",
                display: "block",
              }}
            />
            FAQ
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
            Questions,{" "}
            <em style={{ fontStyle: "italic", color: "#a87d36" }}>
              answered.
            </em>
          </h2>
        </div>

        {/* FAQ list */}
        <div style={{ borderTop: "1px solid #e8e2d6" }}>
          {FAQS.map((faq) => {
            const isOpen = open === faq.num;
            return (
              <div
                key={faq.num}
                onClick={() => setOpen(isOpen ? null : faq.num)}
                style={{
                  borderBottom: "1px solid #e8e2d6",
                  padding: "32px 0",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "60px 1fr auto",
                  gap: 24,
                  alignItems: "start",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    fontSize: 12,
                    color: "#a87d36",
                    letterSpacing: "0.12em",
                    fontWeight: 500,
                    paddingTop: 4,
                  }}
                >
                  {faq.num}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 22,
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                      color: "#0e0d0b",
                    }}
                  >
                    {faq.q}
                  </div>
                  <div
                    style={{
                      maxHeight: isOpen ? 400 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.4s ease, margin-top 0.3s",
                      marginTop: isOpen ? 16 : 0,
                      color: "#3a3a34",
                      fontSize: 15,
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.a}
                  </div>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `1px solid ${isOpen ? "#c8984a" : "#d4cbb8"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: isOpen ? "#0e0d0b" : "#0e0d0b",
                    background: isOpen ? "#c8984a" : "#fff",
                    transition: "all 0.3s",
                    transform: isOpen ? "rotate(45deg)" : "none",
                    flexShrink: 0,
                  }}
                >
                  +
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
