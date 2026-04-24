"use client";

import { useState } from "react";
import type { Database } from "@/types/database";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

type StatusFilter = "all" | "confirmed" | "pending" | "cancelled" | "no_show";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: "#d1fae5", color: "#065f46", label: "Confirmed" },
  pending: { bg: "#fef9c3", color: "#713f12", label: "Pending" },
  cancelled: { bg: "#fee2e2", color: "#7f1d1d", label: "Cancelled" },
  no_show: { bg: "#f3f4f6", color: "#374151", label: "No-show" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function formatPackage(p: string): string {
  if (p === "studio_only") return "Studio Only";
  if (p === "all_inclusive") return "All-Inclusive";
  return p;
}

interface BookingsTableProps {
  bookings: BookingRow[];
  onSelect: (booking: BookingRow) => void;
}

export default function BookingsTable({ bookings, onSelect }: BookingsTableProps) {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");

  const filtered =
    activeFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeFilter);

  const badge = (status: string) => {
    const s = STATUS_BADGE[status] ?? { bg: "#f3f4f6", color: "#374151", label: status };
    return (
      <span
        style={{
          display: "inline-block",
          padding: "2px 10px",
          borderRadius: 100,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          background: s.bg,
          color: s.color,
        }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div>
      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          borderBottom: "1px solid #e8e2d6",
          paddingBottom: 0,
        }}
      >
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "none",
              borderBottom: activeFilter === value ? "2px solid #c8984a" : "2px solid transparent",
              color: activeFilter === value ? "#c8984a" : "#8a857a",
              fontSize: 13,
              fontWeight: activeFilter === value ? 600 : 400,
              cursor: "pointer",
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "#8a857a",
            fontSize: 14,
          }}
        >
          No bookings found.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e8e2d6" }}>
                {["Date", "Time", "Client", "Package", "Total", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#8a857a",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => onSelect(booking)}
                  style={{
                    borderBottom: "1px solid #f5f0e8",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "#faf7f2";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                  }}
                >
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#0e0d0b", whiteSpace: "nowrap" }}>
                    {formatDate(booking.booking_date)}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#3a3a34", whiteSpace: "nowrap" }}>
                    {booking.start_time}–{booking.end_time}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#0e0d0b", fontWeight: 500 }}>
                    {booking.client_name}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#3a3a34" }}>
                    {formatPackage(booking.package_type)}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#3a3a34", whiteSpace: "nowrap" }}>
                    R{(booking.subtotal as number).toFixed(2)}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {badge(booking.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
