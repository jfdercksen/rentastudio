import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Booking Confirmed — Kyalami Studio",
  description: "Your Kyalami Studio booking has been confirmed.",
};

interface PageProps {
  searchParams: Promise<{ m_payment_id?: string }>;
}

function formatPackage(packageType: string): string {
  if (packageType === "studio_only") return "Studio Only";
  if (packageType === "all_inclusive") return "All-Inclusive";
  return packageType;
}

function formatDuration(durationType: string): string {
  if (durationType === "hourly") return "Hourly";
  if (durationType === "half_day") return "Half Day (4 hours)";
  if (durationType === "full_day") return "Full Day (8 hours)";
  return durationType;
}

export default async function ConfirmedPage({ searchParams }: PageProps) {
  // MUST await searchParams — Next.js 15 requirement (see no-bad-patterns.md)
  const params = await searchParams;
  const paymentId = params.m_payment_id;

  if (!paymentId) {
    return <ErrorState message="Booking not found. Please contact us on 082 990 2219." />;
  }

  interface BookingRow {
    id: string;
    client_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    package_type: string;
    duration_type: string;
    add_ons: unknown;
    subtotal: number;
    deposit_amount: number;
    total_amount: number;
    status: string;
  }

  const supabase = await createClient();
  const { data: bookingRaw } = await supabase
    .from("bookings")
    .select(
      "id, client_name, booking_date, start_time, end_time, package_type, duration_type, add_ons, subtotal, deposit_amount, total_amount, status"
    )
    .eq("payfast_payment_id", paymentId)
    .single();

  const booking = bookingRaw as BookingRow | null;

  if (!booking) {
    return <ErrorState message="Booking not found. Please contact us on 082 990 2219." />;
  }

  // Payment is processing — do NOT show booking details yet
  if (booking.status === "pending") {
    return (
      <>
        <Nav />
        <main
          style={{
            minHeight: "100vh",
            background: "#f5f0e8",
            paddingTop: 140,
            paddingBottom: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Auto-refresh every 5 seconds until confirmed */}
          {/* eslint-disable-next-line @next/next/no-head-element */}
          <meta httpEquiv="refresh" content={`5;url=/booking/confirmed?m_payment_id=${paymentId}`} />
          <div
            style={{
              maxWidth: 480,
              textAlign: "center",
              padding: "0 32px",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: "#f3e6cb",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 28,
              }}
            >
              ⏳
            </div>
            <h1
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: "-0.02em",
                color: "#0e0d0b",
                marginBottom: 16,
              }}
            >
              Payment Processing
            </h1>
            <p style={{ fontSize: 16, color: "#3a3a34", lineHeight: 1.6 }}>
              Your payment is being confirmed. This page will refresh
              automatically in a few seconds.
            </p>
            <p style={{ marginTop: 12, fontSize: 14, color: "#8a857a" }}>
              Do not close this tab.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (booking.status !== "confirmed") {
    return (
      <ErrorState message="This booking is not confirmed. Please contact us on 082 990 2219 if you have questions." />
    );
  }

  const addOns = Array.isArray(booking.add_ons)
    ? (booking.add_ons as string[])
    : [];

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
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 32px" }}>
          {/* Success icon */}
          <div
            style={{
              width: 64,
              height: 64,
              background: "#c8984a",
              color: "#0e0d0b",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              marginBottom: 24,
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "#0e0d0b",
              marginBottom: 8,
            }}
          >
            Booking Confirmed
          </h1>
          <p style={{ fontSize: 16, color: "#3a3a34", marginBottom: 40 }}>
            We look forward to your shoot, {booking.client_name.split(" ")[0]}.
            Your confirmation has been sent by email.
          </p>

          {/* Booking details card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e2d6",
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: "#0e0d0b",
                padding: "20px 28px",
                position: "relative",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "#c8984a",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#c8984a",
                  margin: 0,
                }}
              >
                Booking Details
              </p>
            </div>
            <div style={{ padding: 28 }}>
              {[
                ["Date", booking.booking_date],
                [
                  "Time",
                  `${booking.start_time} – ${booking.end_time}`,
                ],
                ["Package", formatPackage(booking.package_type)],
                ["Duration", formatDuration(booking.duration_type)],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #f5f0e8",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#8a857a" }}>{label}</span>
                  <span style={{ fontWeight: 500, color: "#0e0d0b" }}>{val}</span>
                </div>
              ))}

              {addOns.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #f5f0e8",
                    fontSize: 14,
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <span style={{ color: "#8a857a" }}>Add-ons</span>
                  <span
                    style={{
                      fontWeight: 500,
                      color: "#0e0d0b",
                      textAlign: "right",
                    }}
                  >
                    {addOns.join(", ")}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 0 0",
                  fontSize: 13,
                  color: "#a87d36",
                }}
              >
                <span>Deposit (refundable within 48–72hrs)</span>
                <span>R{(booking.deposit_amount as number).toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0 0",
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 22,
                  color: "#0e0d0b",
                }}
              >
                <span>Total Paid</span>
                <span style={{ color: "#a87d36" }}>
                  R{(booking.total_amount as number).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Deposit note */}
          <div
            style={{
              padding: "16px 20px",
              background: "#e8efea",
              borderLeft: "3px solid #2f5f3f",
              borderRadius: 4,
              marginBottom: 32,
              fontSize: 13,
              color: "#3a3a34",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#2f5f3f" }}>Deposit refund:</strong> Your
            R{(booking.deposit_amount as number).toFixed(2)} breakage deposit
            will be refunded to your bank account within 48–72 hours after the
            session, once the studio has been inspected.
          </div>

          <div
            style={{
              fontSize: 14,
              color: "#3a3a34",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            The full address will be shared via WhatsApp before your session.
            <br />
            Questions?{" "}
            <a
              href="tel:0829902219"
              style={{ color: "#a87d36", fontWeight: 500 }}
            >
              082 990 2219
            </a>{" "}
            or{" "}
            <a
              href="mailto:bookings@kyalamistudio.co.za"
              style={{ color: "#a87d36", fontWeight: 500 }}
            >
              bookings@kyalamistudio.co.za
            </a>
          </div>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 28px",
              background: "#0e0d0b",
              color: "#faf7f2",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f0e8",
          paddingTop: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center", padding: "0 32px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#fde8e2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 24px",
            }}
          >
            ✕
          </div>
          <h1
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 32,
              fontWeight: 300,
              color: "#0e0d0b",
              marginBottom: 16,
            }}
          >
            Something went wrong
          </h1>
          <p style={{ fontSize: 15, color: "#3a3a34", lineHeight: 1.6 }}>
            {message}
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              marginTop: 28,
              padding: "14px 28px",
              background: "#0e0d0b",
              color: "#faf7f2",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
