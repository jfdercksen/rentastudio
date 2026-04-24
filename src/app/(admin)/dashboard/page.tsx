import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Dashboard — Kyalami Studio Admin",
};

function getDateRange() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthEnd = today.slice(0, 7) + "-" + String(lastDay).padStart(2, "0");

  const sevenDays = new Date(now);
  sevenDays.setDate(sevenDays.getDate() + 7);
  const sevenDaysLater = sevenDays.toISOString().split("T")[0];

  return { today, monthStart, monthEnd, sevenDaysLater };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPackage(p: string): string {
  if (p === "studio_only") return "Studio Only";
  if (p === "all_inclusive") return "All-Inclusive";
  return p;
}

const QUICK_LINKS = [
  { href: "/dashboard/bookings", label: "Bookings", desc: "View and manage all bookings" },
  { href: "/dashboard/pricing", label: "Pricing", desc: "Edit package and add-on prices" },
  { href: "/dashboard/gallery", label: "Gallery", desc: "Upload and manage gallery images" },
  { href: "/dashboard/content", label: "Content", desc: "Edit FAQ, T&C, and footer" },
];

export default async function DashboardPage() {
  const supabase = createAdminClient();
  const { today, monthStart, monthEnd, sevenDaysLater } = getDateRange();

  const [
    { data: todayRows },
    { data: monthRows },
    { data: upcomingRows },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id")
      .eq("booking_date", today)
      .eq("status", "confirmed"),
    supabase
      .from("bookings")
      .select("subtotal")
      .gte("booking_date", monthStart)
      .lte("booking_date", monthEnd)
      .eq("status", "confirmed"),
    supabase
      .from("bookings")
      .select("client_name, booking_date, start_time, package_type, status")
      .gte("booking_date", today)
      .lte("booking_date", sevenDaysLater)
      .eq("status", "confirmed")
      .order("booking_date"),
  ]);

  const todayCount = todayRows?.length ?? 0;
  const monthCount = monthRows?.length ?? 0;
  const revenue = (monthRows ?? []).reduce(
    (sum, b) => sum + ((b.subtotal as number) ?? 0),
    0
  );

  const upcoming = upcomingRows ?? [];

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 32,
          fontWeight: 300,
          letterSpacing: "-0.02em",
          color: "#0e0d0b",
          marginBottom: 32,
        }}
      >
        Dashboard
      </h1>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {[
          { label: "Today's Bookings", value: String(todayCount), sub: "confirmed" },
          { label: "This Month", value: String(monthCount), sub: "confirmed bookings" },
          {
            label: "Monthly Revenue",
            value: `R${revenue.toFixed(2)}`,
            sub: "confirmed bookings",
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              border: "1px solid #e8e2d6",
              borderRadius: 10,
              padding: "24px 28px",
            }}
          >
            <div style={{ fontSize: 13, color: "#8a857a", marginBottom: 8 }}>
              {label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 36,
                fontWeight: 300,
                color: "#0e0d0b",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: 12, color: "#a09890" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e2d6",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid #e8e2d6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#0e0d0b",
              margin: 0,
            }}
          >
            Upcoming Bookings (next 7 days)
          </h2>
          <Link
            href="/dashboard/bookings"
            style={{ fontSize: 13, color: "#a87d36", textDecoration: "none" }}
          >
            View all →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div
            style={{
              padding: "40px 28px",
              textAlign: "center",
              color: "#8a857a",
              fontSize: 14,
            }}
          >
            No confirmed bookings in the next 7 days.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f5f0e8" }}>
                {["Date", "Time", "Client", "Package"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 28px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#8a857a",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcoming.map((b, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid #f5f0e8" }}
                >
                  <td style={{ padding: "14px 28px", fontSize: 14, color: "#0e0d0b" }}>
                    {formatDate(b.booking_date as string)}
                  </td>
                  <td style={{ padding: "14px 28px", fontSize: 14, color: "#3a3a34" }}>
                    {b.start_time as string}
                  </td>
                  <td style={{ padding: "14px 28px", fontSize: 14, color: "#0e0d0b", fontWeight: 500 }}>
                    {b.client_name as string}
                  </td>
                  <td style={{ padding: "14px 28px", fontSize: 14, color: "#3a3a34" }}>
                    {formatPackage(b.package_type as string)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick links */}
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#0e0d0b",
          marginBottom: 16,
        }}
      >
        Quick Links
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        {QUICK_LINKS.map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "block",
              padding: "20px 24px",
              background: "#fff",
              border: "1px solid #e8e2d6",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#0e0d0b",
                marginBottom: 6,
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 13, color: "#8a857a", lineHeight: 1.4 }}>
              {desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
