"use client";

import { useState, useEffect, useCallback } from "react";

interface AbandonedBooking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  booking_details: {
    date?: string;
    startTime?: string;
    packageType?: string;
    durationType?: string;
  };
  step_reached: string;
  email_1_sent_at: string | null;
  email_2_sent_at: string | null;
  email_3_sent_at: string | null;
  is_recovered: boolean;
  recovered_at: string | null;
  created_at: string;
  updated_at: string;
}

function formatDate(s: string): string {
  const d = new Date(s);
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(s: string): string {
  const d = new Date(s);
  return d.toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatPackage(p?: string): string {
  if (p === "studio_only") return "Studio Only";
  if (p === "all_inclusive") return "All-Inclusive";
  return p ?? "—";
}

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontFamily: "monospace",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#8a857a",
};

export default function AbandonedBookingsPage() {
  const [records, setRecords] = useState<AbandonedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "recovered">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/abandoned-bookings");
      if (res.ok) {
        const data = await res.json();
        setRecords(data.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = records.filter((r) => {
    if (filter === "active") return !r.is_recovered;
    if (filter === "recovered") return r.is_recovered;
    return true;
  });

  const totalCount = records.length;
  const activeCount = records.filter((r) => !r.is_recovered).length;
  const recoveredCount = records.filter((r) => r.is_recovered).length;

  function emailStatus(r: AbandonedBooking): string {
    if (r.is_recovered) return "Recovered";
    if (r.email_3_sent_at) return "All 3 sent";
    if (r.email_2_sent_at) return "2 sent";
    if (r.email_1_sent_at) return "1 sent";
    return "Pending";
  }

  function emailStatusColor(r: AbandonedBooking): string {
    if (r.is_recovered) return "#2f5f3f";
    if (r.email_3_sent_at) return "#a87d36";
    if (r.email_1_sent_at) return "#5c7ca8";
    return "#8a857a";
  }

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 32, fontWeight: 300, letterSpacing: "-0.02em", color: "#0e0d0b", marginBottom: 32 }}>
        Abandoned Bookings
      </h1>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        {[
          { label: "Total Abandoned", value: totalCount, sub: "all time" },
          { label: "Active (unrecovered)", value: activeCount, sub: "awaiting follow-up" },
          { label: "Recovered", value: recoveredCount, sub: "completed booking after abandonment" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e8e2d6", borderRadius: 10, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, color: "#8a857a", marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 32, fontWeight: 300, color: "#0e0d0b", lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: "#a09890" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["all", "active", "recovered"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 18px",
              border: "1px solid #d4cdc4",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              background: filter === f ? "#0e0d0b" : "#fff",
              color: filter === f ? "#faf7f2" : "#3a3a34",
              fontWeight: filter === f ? 600 : 400,
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e8e2d6", borderRadius: 10, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px 28px", textAlign: "center", color: "#8a857a", fontSize: 14 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 28px", textAlign: "center", color: "#8a857a", fontSize: 14 }}>No records found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f5f0e8" }}>
                {["Client", "Booking Details", "Step Reached", "Abandoned", "Email Status"].map((h) => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, color: "#8a857a", fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f5f0e8", background: r.is_recovered ? "#f5fbf6" : "#fff" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: "#0e0d0b" }}>{r.client_name}</div>
                    <div style={{ fontSize: 12, color: "#8a857a" }}>{r.client_email}</div>
                    {r.client_phone && <div style={{ fontSize: 12, color: "#8a857a" }}>{r.client_phone}</div>}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    {r.booking_details.date ? (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#0e0d0b" }}>{formatDate(r.booking_details.date)}</div>
                        {r.booking_details.startTime && <div style={{ fontSize: 12, color: "#8a857a" }}>{r.booking_details.startTime}</div>}
                        {r.booking_details.packageType && <div style={{ fontSize: 12, color: "#8a857a" }}>{formatPackage(r.booking_details.packageType)}</div>}
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: "#8a857a" }}>No details captured</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      ...LABEL,
                      background: "#f5f0e8",
                      padding: "3px 8px",
                      borderRadius: 4,
                      color: r.step_reached === "payment" ? "#a87d36" : "#8a857a",
                    }}>
                      {r.step_reached}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#8a857a" }}>
                    {formatDateTime(r.created_at)}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: emailStatusColor(r) }}>{emailStatus(r)}</div>
                    {r.email_1_sent_at && <div style={{ fontSize: 11, color: "#a09890", marginTop: 2 }}>E1: {formatDateTime(r.email_1_sent_at)}</div>}
                    {r.email_2_sent_at && <div style={{ fontSize: 11, color: "#a09890" }}>E2: {formatDateTime(r.email_2_sent_at)}</div>}
                    {r.email_3_sent_at && <div style={{ fontSize: 11, color: "#a09890" }}>E3: {formatDateTime(r.email_3_sent_at)}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
