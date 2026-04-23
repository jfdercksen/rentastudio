import type { Metadata } from "next";
import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";
import BookingForm from "@/components/public/booking/BookingForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Book Your Session — Kyalami Studio",
  description:
    "Book your Kyalami Studio session online. Select your date, package, and add-ons.",
};

export default async function BookingPage() {
  const supabase = await createClient();

  const [{ data: pricing }, { data: addOns }] = await Promise.all([
    supabase.from("pricing").select("*"),
    supabase
      .from("add_ons")
      .select("*")
      .eq("is_active", true)
      .order("display_order"),
  ]);

  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f0e8",
          paddingTop: 120,
          paddingBottom: 80,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 12,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#a87d36",
              marginBottom: 16,
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
            Book &amp; Pay
          </div>
          <h1
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "#0e0d0b",
              marginBottom: 16,
            }}
          >
            Reserve your{" "}
            <em style={{ fontStyle: "italic", color: "#a87d36" }}>
              time in the studio.
            </em>
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#3a3a34",
              marginBottom: 48,
              lineHeight: 1.6,
              maxWidth: 600,
            }}
          >
            Fill in the form below to secure your slot. Pay securely via
            PayFast and receive confirmation within minutes.
          </p>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e2d6",
              borderRadius: 10,
              padding: "44px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
            className="booking-form-card"
          >
            <BookingForm
              pricing={pricing ?? []}
              addOns={addOns ?? []}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
