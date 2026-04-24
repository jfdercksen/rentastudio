"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/types/database";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

interface BookingDetailModalProps {
  booking: BookingRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: string) => void;
}

function formatPackage(p: string): string {
  if (p === "studio_only") return "Studio Only";
  if (p === "all_inclusive") return "All-Inclusive";
  return p;
}

function formatDuration(d: string): string {
  if (d === "hourly") return "Hourly";
  if (d === "half_day") return "Half Day (4 hrs)";
  if (d === "full_day") return "Full Day (8 hrs)";
  return d;
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #f5f0e8",
        fontSize: 13,
        gap: 16,
      }}
    >
      <span style={{ color: "#8a857a", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#0e0d0b", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-ibm-plex-mono), monospace",
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#a87d36",
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

export default function BookingDetailModal({
  booking,
  open,
  onOpenChange,
  onStatusChange,
}: BookingDetailModalProps) {
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);

  if (!booking) return null;

  const addOns = Array.isArray(booking.add_ons)
    ? (booking.add_ons as string[])
    : [];

  async function handleIdDocument() {
    if (!booking) return;
    setLoadingSignedUrl(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/id-document`);
      if (!res.ok) {
        alert("Could not load ID document. It may not have been uploaded.");
        return;
      }
      const { signedUrl } = (await res.json()) as { signedUrl: string };
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      alert("Failed to load ID document.");
    } finally {
      setLoadingSignedUrl(false);
    }
  }

  function handleAction(newStatus: "no_show" | "cancelled") {
    const label = newStatus === "no_show" ? "no-show" : "cancel";
    const confirmed = window.confirm(
      `Mark this booking as ${label}? This cannot be undone.`
    );
    if (confirmed && booking) {
      onStatusChange(booking.id, newStatus);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 300, fontSize: 22 }}>
            Booking Detail
          </DialogTitle>
        </DialogHeader>

        {/* Client details */}
        <SectionHeading>Client Details</SectionHeading>
        <DetailRow label="Name" value={booking.client_name} />
        <DetailRow label="Email" value={booking.client_email} />
        <DetailRow label="Phone" value={booking.client_phone} />
        <DetailRow label="Shoot type" value={booking.shoot_type} />

        {/* Booking details */}
        <SectionHeading>Booking Details</SectionHeading>
        <DetailRow label="Date" value={booking.booking_date} />
        <DetailRow label="Time" value={`${booking.start_time} – ${booking.end_time}`} />
        <DetailRow label="Package" value={formatPackage(booking.package_type)} />
        <DetailRow label="Duration" value={formatDuration(booking.duration_type)} />
        {addOns.length > 0 && (
          <DetailRow label="Add-ons" value={addOns.join(", ")} />
        )}
        <DetailRow label="Status" value={booking.status} />
        <DetailRow label="Created" value={booking.created_at} />

        {/* Payment */}
        <SectionHeading>Payment</SectionHeading>
        <DetailRow label="Subtotal" value={`R${(booking.subtotal as number).toFixed(2)}`} />
        <DetailRow label="Deposit" value={`R${(booking.deposit_amount as number).toFixed(2)}`} />
        <DetailRow label="Total paid" value={`R${(booking.total_amount as number).toFixed(2)}`} />
        <DetailRow label="Payment ID" value={booking.payfast_payment_id} />
        <DetailRow label="PayFast gross" value={booking.payfast_amount_gross} />

        {/* Banking details */}
        {(booking.bank_holder_name || booking.bank_name) && (
          <>
            <SectionHeading>Banking Details (Deposit Refund)</SectionHeading>
            <DetailRow label="Account holder" value={booking.bank_holder_name} />
            <DetailRow label="Bank" value={booking.bank_name} />
            <DetailRow label="Account number" value={booking.account_number} />
            <DetailRow label="Branch code" value={booking.branch_code} />
          </>
        )}

        {/* ID document */}
        {booking.id_document_url && (
          <div style={{ marginTop: 16 }}>
            <SectionHeading>ID Document</SectionHeading>
            <button
              onClick={handleIdDocument}
              disabled={loadingSignedUrl}
              style={{
                padding: "9px 18px",
                background: loadingSignedUrl ? "#e8e2d6" : "#0e0d0b",
                color: loadingSignedUrl ? "#8a857a" : "#faf7f2",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                cursor: loadingSignedUrl ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}
            >
              {loadingSignedUrl ? "Loading..." : "Download ID Document"}
            </button>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <>
            <SectionHeading>Notes</SectionHeading>
            <p style={{ fontSize: 13, color: "#3a3a34", lineHeight: 1.6 }}>
              {booking.notes}
            </p>
          </>
        )}

        {/* Actions */}
        {(booking.status === "confirmed" || booking.status === "pending") && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid #e8e2d6",
            }}
          >
            <button
              onClick={() => handleAction("no_show")}
              style={{
                padding: "9px 18px",
                background: "#fef9c3",
                color: "#713f12",
                border: "1px solid #fde68a",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Mark No-show
            </button>
            <button
              onClick={() => handleAction("cancelled")}
              style={{
                padding: "9px 18px",
                background: "#fee2e2",
                color: "#7f1d1d",
                border: "1px solid #fca5a5",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cancel Booking
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
