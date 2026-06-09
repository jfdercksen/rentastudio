"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

interface AddOn {
  id: string;
  name: string;
  description: string | null;
  price_rands: number;
}

interface BookingData {
  id: string;
  clientName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  packageType: string;
  durationType: string;
  isWeekday: boolean;
  addOns: string[];
  subtotal: number;
  depositAmount: number;
  totalAmount: number;
  status: string;
  shootType: string | null;
}

interface PortalData {
  booking: BookingData;
  availableAddOns: AddOn[];
  isModifiable: boolean;
  isPast: boolean;
}

type View = "details" | "reschedule" | "addons" | "success";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatPackage(p: string): string {
  if (p === "studio_only") return "Studio Only";
  if (p === "all_inclusive") return "All-Inclusive";
  return p;
}

function formatDuration(d: string): string {
  if (d === "hourly") return "Hourly";
  if (d === "half_day") return "Half Day (4 hours)";
  if (d === "full_day") return "Full Day";
  return d;
}

function statusColor(s: string): string {
  if (s === "confirmed") return "#2f5f3f";
  if (s === "cancelled") return "#b84040";
  if (s === "pending") return "#a87d36";
  return "#8a857a";
}

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontFamily: "var(--font-ibm-plex-mono, monospace)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#8a857a",
  marginBottom: 4,
};

const VALUE: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 500,
  color: "#0e0d0b",
  marginBottom: 16,
};

const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e2d6",
  borderRadius: 10,
  padding: "28px 32px",
  marginBottom: 20,
};

const BTN_PRIMARY: React.CSSProperties = {
  display: "inline-block",
  background: "#c8984a",
  color: "#0e0d0b",
  border: "none",
  borderRadius: 6,
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};

const BTN_SECONDARY: React.CSSProperties = {
  display: "inline-block",
  background: "transparent",
  color: "#0e0d0b",
  border: "1px solid #d4cdc4",
  borderRadius: 6,
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

export default function ManageBookingPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";

  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("details");

  // Reschedule state
  const [newDate, setNewDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [newDuration, setNewDuration] = useState<string>("");

  // Add-ons state
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchPortal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/booking/manage/${token}`);
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "This link is invalid or has expired.");
        return;
      }
      const data: PortalData = await res.json();
      setPortalData(data);
      // Initialise add-on selection from current booking
      const currentAddOnNames = data.booking.addOns ?? [];
      const matchedIds = data.availableAddOns
        .filter((a) => currentAddOnNames.includes(a.name))
        .map((a) => a.id);
      setSelectedAddOnIds(matchedIds);
      setNewDuration(data.booking.durationType);
    } catch {
      setError("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPortal(); }, [fetchPortal]);

  async function fetchSlots(date: string) {
    if (!date) return;
    setLoadingSlots(true);
    setSelectedSlot("");
    try {
      const res = await fetch(`/api/availability?date=${date}`);
      const data = await res.json();
      if (data.blocked) {
        setAvailableSlots([]);
      } else {
        setAvailableSlots(data.slots ?? []);
      }
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleReschedule() {
    if (!newDate && !selectedSlot && newDuration === portalData?.booking.durationType) {
      setSubmitError("No changes selected.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: Record<string, string> = {};
      if (newDate) body.newDate = newDate;
      if (selectedSlot) body.newStartTime = selectedSlot;
      if (newDuration !== portalData?.booking.durationType) body.newDurationType = newDuration;

      const res = await fetch(`/api/booking/manage/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to update booking.");
        return;
      }
      await fetchPortal();
      setView("success");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateAddOns() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/booking/manage/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addOnIds: selectedAddOnIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to update add-ons.");
        return;
      }
      await fetchPortal();
      setView("success");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  // Calculate live add-on pricing
  const addOnTotal = portalData
    ? portalData.availableAddOns
        .filter((a) => selectedAddOnIds.includes(a.id))
        .reduce((sum, a) => sum + a.price_rands, 0)
    : 0;

  // ── Layout wrapper ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>
      {/* Header */}
      <header style={{ background: "#0e0d0b", borderBottom: "1px solid #1a1a18" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-fraunces, Georgia), serif", fontSize: 20, fontWeight: 300, color: "#faf7f2", letterSpacing: "-0.01em" }}>
              Kyalami Studio
            </div>
            <div style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8984a", marginTop: 2 }}>
              Manage My Booking
            </div>
          </div>
          <a href="/" style={{ fontSize: 13, color: "#a09890", textDecoration: "none" }}>← Back to site</a>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#8a857a", fontSize: 15 }}>
            Loading your booking…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={CARD}>
            <h2 style={{ fontFamily: "var(--font-fraunces, Georgia), serif", fontSize: 24, fontWeight: 300, color: "#0e0d0b", margin: "0 0 12px" }}>
              Link unavailable
            </h2>
            <p style={{ fontSize: 15, color: "#3a3a34", lineHeight: 1.6, margin: "0 0 24px" }}>{error}</p>
            <a href="/booking" style={BTN_PRIMARY}>Make a New Booking</a>
          </div>
        )}

        {/* Success state */}
        {!loading && portalData && view === "success" && (
          <div style={CARD}>
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
              <h2 style={{ fontFamily: "var(--font-fraunces, Georgia), serif", fontSize: 26, fontWeight: 300, color: "#2f5f3f", margin: "0 0 12px" }}>
                Booking Updated
              </h2>
              <p style={{ fontSize: 15, color: "#3a3a34", lineHeight: 1.6, marginBottom: 28 }}>
                Your booking has been updated and a confirmation email has been sent to you.
              </p>
              <button style={BTN_PRIMARY} onClick={() => setView("details")}>
                View Updated Booking
              </button>
            </div>
          </div>
        )}

        {/* Main details view */}
        {!loading && portalData && view === "details" && (
          <>
            {/* Status banner */}
            {portalData.isPast && (
              <div style={{ background: "#f5f0e8", border: "1px solid #e8e2d6", borderRadius: 8, padding: "14px 20px", marginBottom: 20, fontSize: 14, color: "#8a857a" }}>
                This booking date has passed. View-only mode.
              </div>
            )}

            {/* Booking details card */}
            <div style={CARD}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <h1 style={{ fontFamily: "var(--font-fraunces, Georgia), serif", fontSize: 26, fontWeight: 300, color: "#0e0d0b", margin: 0 }}>
                  Your Booking
                </h1>
                <span style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: statusColor(portalData.booking.status), background: "#f5f0e8", padding: "4px 10px", borderRadius: 4 }}>
                  {portalData.booking.status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div>
                  <div style={LABEL}>Date</div>
                  <div style={VALUE}>{formatDate(portalData.booking.bookingDate)}</div>
                </div>
                <div>
                  <div style={LABEL}>Time</div>
                  <div style={VALUE}>{portalData.booking.startTime} – {portalData.booking.endTime}</div>
                </div>
                <div>
                  <div style={LABEL}>Package</div>
                  <div style={VALUE}>{formatPackage(portalData.booking.packageType)}</div>
                </div>
                <div>
                  <div style={LABEL}>Duration</div>
                  <div style={VALUE}>{formatDuration(portalData.booking.durationType)}</div>
                </div>
              </div>

              {/* Add-ons */}
              <div style={{ borderTop: "1px solid #f0ebe2", paddingTop: 16, marginTop: 8 }}>
                <div style={LABEL}>Extras / Add-ons</div>
                {portalData.booking.addOns.length > 0 ? (
                  <ul style={{ margin: "6px 0 0", paddingLeft: 20, fontSize: 14, color: "#3a3a34" }}>
                    {portalData.booking.addOns.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                ) : (
                  <div style={{ fontSize: 14, color: "#8a857a", marginTop: 4 }}>None selected</div>
                )}
              </div>
            </div>

            {/* Pricing card */}
            <div style={{ background: "#0e0d0b", borderRadius: 10, padding: "24px 28px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#c8984a" }} />
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#faf7f2", fontSize: 14 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "6px 0", opacity: 0.7 }}>Package subtotal</td>
                    <td style={{ padding: "6px 0", textAlign: "right" }}>R{portalData.booking.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 0", color: "#c8984a" }}>Deposit (refundable)</td>
                    <td style={{ padding: "6px 0", textAlign: "right", color: "#c8984a" }}>R{portalData.booking.depositAmount.toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                    <td style={{ padding: "14px 0 6px", fontFamily: "Georgia, serif", fontSize: 20, color: "#c8984a" }}>Total</td>
                    <td style={{ padding: "14px 0 6px", textAlign: "right", fontFamily: "Georgia, serif", fontSize: 20, color: "#c8984a" }}>R{portalData.booking.totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            {portalData.isModifiable && (
              <div style={CARD}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0e0d0b", margin: "0 0 16px" }}>Modify Booking</h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button style={BTN_PRIMARY} onClick={() => setView("reschedule")}>
                    Change Date / Time
                  </button>
                  <button style={BTN_SECONDARY} onClick={() => setView("addons")}>
                    Manage Extras
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "#8a857a", marginTop: 14, lineHeight: 1.5 }}>
                  Changes take effect immediately. You will receive a confirmation email.
                </p>
              </div>
            )}

            <p style={{ fontSize: 13, color: "#8a857a", textAlign: "center", marginTop: 8 }}>
              Questions? Call <strong style={{ color: "#0e0d0b" }}>082 990 2219</strong> or email{" "}
              <a href="mailto:bookings@kyalamistudio.co.za" style={{ color: "#a87d36" }}>bookings@kyalamistudio.co.za</a>
            </p>
          </>
        )}

        {/* Reschedule view */}
        {!loading && portalData && view === "reschedule" && (
          <div style={CARD}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <button style={{ ...BTN_SECONDARY, padding: "8px 14px" }} onClick={() => { setView("details"); setSubmitError(null); }}>
                ← Back
              </button>
              <h2 style={{ fontFamily: "var(--font-fraunces, Georgia), serif", fontSize: 22, fontWeight: 300, color: "#0e0d0b", margin: 0 }}>
                Change Date &amp; Time
              </h2>
            </div>

            {/* Current booking info */}
            <div style={{ background: "#f5f0e8", borderRadius: 6, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#8a857a" }}>
              Current: <strong style={{ color: "#0e0d0b" }}>{formatDate(portalData.booking.bookingDate)}</strong> at <strong style={{ color: "#0e0d0b" }}>{portalData.booking.startTime}</strong>
            </div>

            {/* Date picker */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ ...LABEL, display: "block" }}>New Date</label>
              <input
                type="date"
                min={today}
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  fetchSlots(e.target.value);
                }}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d4cdc4", borderRadius: 6, fontSize: 14, background: "#fff", boxSizing: "border-box" }}
              />
            </div>

            {/* Time slots */}
            {newDate && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...LABEL, display: "block" }}>Select Time Slot</label>
                {loadingSlots ? (
                  <p style={{ fontSize: 14, color: "#8a857a" }}>Checking availability…</p>
                ) : availableSlots.length === 0 ? (
                  <p style={{ fontSize: 14, color: "#b84040" }}>No slots available on this date.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.start}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.available ? slot.start : selectedSlot)}
                        style={{
                          padding: "10px 0",
                          border: selectedSlot === slot.start ? "2px solid #c8984a" : "1px solid #d4cdc4",
                          borderRadius: 6,
                          background: !slot.available ? "#f5f0e8" : selectedSlot === slot.start ? "#fdf5e8" : "#fff",
                          color: !slot.available ? "#c0b8ae" : "#0e0d0b",
                          fontSize: 13,
                          cursor: slot.available ? "pointer" : "not-allowed",
                          fontWeight: selectedSlot === slot.start ? 600 : 400,
                        }}
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Duration selector */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ ...LABEL, display: "block" }}>Duration</label>
              <select
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d4cdc4", borderRadius: 6, fontSize: 14, background: "#fff", boxSizing: "border-box" }}
              >
                <option value="hourly">Hourly</option>
                <option value="half_day">Half Day (4 hours)</option>
                <option value="full_day">Full Day</option>
              </select>
            </div>

            {submitError && (
              <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#b84040" }}>
                {submitError}
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                style={{ ...BTN_PRIMARY, opacity: submitting ? 0.6 : 1 }}
                disabled={submitting}
                onClick={handleReschedule}
              >
                {submitting ? "Saving…" : "Confirm Change"}
              </button>
              <button style={BTN_SECONDARY} onClick={() => { setView("details"); setSubmitError(null); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add-ons view */}
        {!loading && portalData && view === "addons" && (
          <div style={CARD}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <button style={{ ...BTN_SECONDARY, padding: "8px 14px" }} onClick={() => { setView("details"); setSubmitError(null); }}>
                ← Back
              </button>
              <h2 style={{ fontFamily: "var(--font-fraunces, Georgia), serif", fontSize: 22, fontWeight: 300, color: "#0e0d0b", margin: 0 }}>
                Manage Extras
              </h2>
            </div>

            {portalData.availableAddOns.length === 0 ? (
              <p style={{ fontSize: 15, color: "#8a857a" }}>No extras currently available.</p>
            ) : (
              <>
                <div style={{ marginBottom: 24 }}>
                  {portalData.availableAddOns.map((addon) => {
                    const checked = selectedAddOnIds.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          padding: "14px 16px",
                          border: checked ? "1.5px solid #c8984a" : "1px solid #e8e2d6",
                          borderRadius: 8,
                          marginBottom: 10,
                          cursor: "pointer",
                          background: checked ? "#fdf5e8" : "#fff",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedAddOnIds((prev) =>
                              checked ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
                            );
                          }}
                          style={{ marginTop: 2, accentColor: "#c8984a", width: 16, height: 16, flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#0e0d0b" }}>{addon.name}</div>
                          {addon.description && <div style={{ fontSize: 13, color: "#8a857a", marginTop: 2 }}>{addon.description}</div>}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#a87d36", whiteSpace: "nowrap" }}>
                          R{addon.price_rands.toFixed(2)}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Updated total preview */}
                <div style={{ background: "#f5f0e8", borderRadius: 8, padding: "16px 20px", marginBottom: 24, fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#8a857a" }}>
                    <span>Extras total</span>
                    <span>R{addOnTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#8a857a" }}>
                    <span>Deposit (refundable)</span>
                    <span>R{portalData.booking.depositAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, color: "#0e0d0b", borderTop: "1px solid #e8e2d6", paddingTop: 10, marginTop: 4 }}>
                    <span>New Total</span>
                    <span>R{(addOnTotal + portalData.booking.depositAmount).toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            {submitError && (
              <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#b84040" }}>
                {submitError}
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                style={{ ...BTN_PRIMARY, opacity: submitting ? 0.6 : 1 }}
                disabled={submitting}
                onClick={handleUpdateAddOns}
              >
                {submitting ? "Saving…" : "Save Extras"}
              </button>
              <button style={BTN_SECONDARY} onClick={() => { setView("details"); setSubmitError(null); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
