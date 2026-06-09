"use client";

import type { Metadata } from "next";
import { useState, useEffect, useCallback } from "react";

// Note: metadata export is only valid in Server Components.
// Title is set via document.title instead.

interface BlockedDate {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

interface BlockedSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_at: string;
}

type CalendarView = "month" | "week" | "day";

function formatDate(s: string): string {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function isoWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function monthDays(year: number, month: number): string[] {
  const days: string[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontFamily: "monospace",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#8a857a",
  display: "block",
  marginBottom: 6,
};

const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #d4cdc4",
  borderRadius: 6,
  fontSize: 14,
  background: "#fff",
  boxSizing: "border-box",
};

const BTN: React.CSSProperties = {
  background: "#c8984a",
  color: "#0e0d0b",
  border: "none",
  borderRadius: 6,
  padding: "10px 20px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const BTN_DANGER: React.CSSProperties = {
  background: "transparent",
  color: "#b84040",
  border: "1px solid #f5c6c6",
  borderRadius: 4,
  padding: "4px 10px",
  fontSize: 12,
  cursor: "pointer",
};

const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e2d6",
  borderRadius: 10,
  padding: "24px 28px",
  marginBottom: 24,
};

export default function AvailabilityPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [calView, setCalView] = useState<CalendarView>("month");
  const [calDate, setCalDate] = useState(todayStr());

  // Block date form
  const [blockStartDate, setBlockStartDate] = useState("");
  const [blockEndDate, setBlockEndDate] = useState("");
  const [blockDateReason, setBlockDateReason] = useState("");
  const [blockDateLoading, setBlockDateLoading] = useState(false);
  const [blockDateError, setBlockDateError] = useState<string | null>(null);

  // Block slot form
  const [slotDate, setSlotDate] = useState("");
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("12:00");
  const [slotReason, setSlotReason] = useState("");
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/availability");
      if (res.ok) {
        const data = await res.json();
        setBlockedDates(data.blockedDates ?? []);
        setBlockedSlots(data.blockedSlots ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleBlockDate() {
    if (!blockStartDate) { setBlockDateError("Start date is required."); return; }
    const end = blockEndDate || blockStartDate;
    setBlockDateLoading(true);
    setBlockDateError(null);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "date", startDate: blockStartDate, endDate: end, reason: blockDateReason || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setBlockDateError(data.error ?? "Failed to block date."); return; }
      setBlockStartDate(""); setBlockEndDate(""); setBlockDateReason("");
      await fetchData();
    } finally {
      setBlockDateLoading(false);
    }
  }

  async function handleBlockSlot() {
    if (!slotDate || !slotStart || !slotEnd) { setSlotError("All fields are required."); return; }
    if (slotEnd <= slotStart) { setSlotError("End time must be after start time."); return; }
    setSlotLoading(true);
    setSlotError(null);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "slot", date: slotDate, startTime: slotStart, endTime: slotEnd, reason: slotReason || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setSlotError(data.error ?? "Failed to block slot."); return; }
      setSlotDate(""); setSlotStart("09:00"); setSlotEnd("12:00"); setSlotReason("");
      await fetchData();
    } finally {
      setSlotLoading(false);
    }
  }

  async function handleDeleteDate(id: string) {
    await fetch(`/api/admin/availability/date/${id}`, { method: "DELETE" });
    await fetchData();
  }

  async function handleDeleteSlot(id: string) {
    await fetch(`/api/admin/availability/slot/${id}`, { method: "DELETE" });
    await fetchData();
  }

  // ─── Calendar helpers ───────────────────────────────────────────────────────
  function isDateBlocked(dateStr: string): boolean {
    return blockedDates.some((b) => b.start_date <= dateStr && b.end_date >= dateStr);
  }

  function hasSlotBlock(dateStr: string): boolean {
    return blockedSlots.some((s) => s.slot_date === dateStr);
  }

  // ─── Calendar rendering ─────────────────────────────────────────────────────
  function renderMonthCalendar() {
    const d = new Date(calDate + "T00:00:00");
    const year = d.getFullYear();
    const month = d.getMonth();
    const days = monthDays(year, month);
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const paddingBefore = firstDow === 0 ? 6 : firstDow - 1;
    const today = todayStr();

    const monthLabel = d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

    function prevMonth() {
      const p = new Date(year, month - 1, 1);
      setCalDate(p.toISOString().split("T")[0]);
    }
    function nextMonth() {
      const n = new Date(year, month + 1, 1);
      setCalDate(n.toISOString().split("T")[0]);
    }

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ ...BTN, background: "transparent", color: "#0e0d0b", border: "1px solid #d4cdc4", padding: "6px 14px" }}>←</button>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#0e0d0b" }}>{monthLabel}</span>
          <button onClick={nextMonth} style={{ ...BTN, background: "transparent", color: "#0e0d0b", border: "1px solid #d4cdc4", padding: "6px 14px" }}>→</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((wd) => (
            <div key={wd} style={{ textAlign: "center", fontSize: 11, color: "#8a857a", fontFamily: "monospace", letterSpacing: "0.05em", textTransform: "uppercase", padding: "6px 0" }}>{wd}</div>
          ))}
          {Array.from({ length: paddingBefore }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const blocked = isDateBlocked(day);
            const hasSlot = hasSlotBlock(day);
            const isToday = day === today;
            return (
              <div
                key={day}
                title={blocked ? "Fully blocked" : hasSlot ? "Partially blocked" : ""}
                style={{
                  textAlign: "center",
                  padding: "8px 2px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 400,
                  background: blocked ? "#fde8e8" : hasSlot ? "#fff3e0" : "#f5f0e8",
                  color: blocked ? "#b84040" : hasSlot ? "#a87d36" : "#3a3a34",
                  border: isToday ? "2px solid #c8984a" : "1px solid transparent",
                  cursor: "default",
                }}
              >
                {parseInt(day.split("-")[2])}
                {blocked && <div style={{ fontSize: 8, color: "#b84040", marginTop: 2 }}>BLOCKED</div>}
                {!blocked && hasSlot && <div style={{ fontSize: 8, color: "#a87d36", marginTop: 2 }}>PARTIAL</div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 12, color: "#8a857a" }}>
          <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#fde8e8", borderRadius: 2, marginRight: 4, verticalAlign: "middle" }} />Fully blocked</span>
          <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#fff3e0", borderRadius: 2, marginRight: 4, verticalAlign: "middle" }} />Partially blocked</span>
          <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#f5f0e8", borderRadius: 2, marginRight: 4, verticalAlign: "middle" }} />Available</span>
        </div>
      </div>
    );
  }

  function renderWeekCalendar() {
    const weekStart = isoWeekStart(calDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const today = todayStr();

    function prevWeek() { setCalDate(addDays(calDate, -7)); }
    function nextWeek() { setCalDate(addDays(calDate, 7)); }

    const weekLabel = `${formatDate(days[0])} – ${formatDate(days[6])}`;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={prevWeek} style={{ ...BTN, background: "transparent", color: "#0e0d0b", border: "1px solid #d4cdc4", padding: "6px 14px" }}>←</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0e0d0b" }}>{weekLabel}</span>
          <button onClick={nextWeek} style={{ ...BTN, background: "transparent", color: "#0e0d0b", border: "1px solid #d4cdc4", padding: "6px 14px" }}>→</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {days.map((day) => {
            const blocked = isDateBlocked(day);
            const slotsForDay = blockedSlots.filter((s) => s.slot_date === day);
            const isToday = day === today;
            const dayLabel = new Date(day + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "short", day: "2-digit" });
            return (
              <div key={day} style={{
                border: isToday ? "2px solid #c8984a" : "1px solid #e8e2d6",
                borderRadius: 8,
                overflow: "hidden",
                minHeight: 100,
              }}>
                <div style={{ background: blocked ? "#fde8e8" : "#f5f0e8", padding: "6px 8px", fontSize: 11, fontWeight: 600, color: blocked ? "#b84040" : "#3a3a34" }}>
                  {dayLabel}
                  {blocked && <div style={{ fontSize: 9, color: "#b84040" }}>BLOCKED</div>}
                </div>
                <div style={{ padding: "6px 8px" }}>
                  {slotsForDay.map((s) => (
                    <div key={s.id} style={{ fontSize: 10, color: "#a87d36", background: "#fff3e0", borderRadius: 3, padding: "2px 4px", marginBottom: 2 }}>
                      {s.start_time}–{s.end_time}
                      {s.reason && <span style={{ color: "#8a857a" }}> {s.reason}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDayCalendar() {
    const slotsForDay = blockedSlots.filter((s) => s.slot_date === calDate);
    const blocked = isDateBlocked(calDate);
    const today = todayStr();

    function prevDay() { setCalDate(addDays(calDate, -1)); }
    function nextDay() { setCalDate(addDays(calDate, 1)); }

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={prevDay} style={{ ...BTN, background: "transparent", color: "#0e0d0b", border: "1px solid #d4cdc4", padding: "6px 14px" }}>←</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0e0d0b" }}>{formatDate(calDate)}</span>
          <button onClick={nextDay} style={{ ...BTN, background: "transparent", color: "#0e0d0b", border: "1px solid #d4cdc4", padding: "6px 14px" }}>→</button>
        </div>
        <input type="date" value={calDate} min={today} onChange={(e) => setCalDate(e.target.value)} style={{ ...INPUT, width: 180, marginBottom: 16 }} />
        {blocked ? (
          <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: 8, padding: "16px 20px", fontSize: 14, color: "#b84040" }}>
            This entire day is blocked.
          </div>
        ) : slotsForDay.length === 0 ? (
          <div style={{ background: "#e8f0ea", border: "1px solid #c0d4c4", borderRadius: 8, padding: "16px 20px", fontSize: 14, color: "#2f5f3f" }}>
            No blocks on this day — fully available.
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0e0d0b", marginBottom: 10 }}>Blocked time slots:</div>
            {slotsForDay.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fff3e0", border: "1px solid #ffe0a8", borderRadius: 6, marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 600, color: "#a87d36" }}>{s.start_time} – {s.end_time}</span>
                  {s.reason && <span style={{ fontSize: 13, color: "#8a857a", marginLeft: 8 }}>{s.reason}</span>}
                </div>
                <button style={BTN_DANGER} onClick={() => handleDeleteSlot(s.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 32, fontWeight: 300, letterSpacing: "-0.02em", color: "#0e0d0b", marginBottom: 32 }}>
        Availability Management
      </h1>

      {/* Calendar */}
      <div style={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0e0d0b", margin: 0 }}>Calendar</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {(["month", "week", "day"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setCalView(v)}
                style={{
                  padding: "6px 14px",
                  border: "1px solid #d4cdc4",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  background: calView === v ? "#0e0d0b" : "#fff",
                  color: calView === v ? "#faf7f2" : "#3a3a34",
                  fontWeight: calView === v ? 600 : 400,
                  textTransform: "capitalize",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#8a857a", fontSize: 14 }}>Loading…</div>
        ) : calView === "month" ? renderMonthCalendar() : calView === "week" ? renderWeekCalendar() : renderDayCalendar()}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Block full date(s) */}
        <div style={CARD}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0e0d0b", margin: "0 0 18px" }}>Block Date(s)</h2>
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Start Date</label>
            <input type="date" value={blockStartDate} onChange={(e) => setBlockStartDate(e.target.value)} style={INPUT} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>End Date <span style={{ color: "#a09890", fontSize: 10 }}>(same as start for single day)</span></label>
            <input type="date" value={blockEndDate} min={blockStartDate} onChange={(e) => setBlockEndDate(e.target.value)} style={INPUT} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={LABEL}>Reason <span style={{ color: "#a09890", fontSize: 10 }}>(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Public holiday, Maintenance"
              value={blockDateReason}
              onChange={(e) => setBlockDateReason(e.target.value)}
              style={INPUT}
            />
          </div>
          {blockDateError && <div style={{ fontSize: 13, color: "#b84040", marginBottom: 12 }}>{blockDateError}</div>}
          <button style={{ ...BTN, opacity: blockDateLoading ? 0.6 : 1 }} disabled={blockDateLoading} onClick={handleBlockDate}>
            {blockDateLoading ? "Blocking…" : "Block Date(s)"}
          </button>
        </div>

        {/* Block time slot */}
        <div style={CARD}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0e0d0b", margin: "0 0 18px" }}>Block Time Slot</h2>
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Date</label>
            <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} style={INPUT} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={LABEL}>Start Time</label>
              <input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} step="3600" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>End Time</label>
              <input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} step="3600" style={INPUT} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={LABEL}>Reason <span style={{ color: "#a09890", fontSize: 10 }}>(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Private event, Equipment servicing"
              value={slotReason}
              onChange={(e) => setSlotReason(e.target.value)}
              style={INPUT}
            />
          </div>
          {slotError && <div style={{ fontSize: 13, color: "#b84040", marginBottom: 12 }}>{slotError}</div>}
          <button style={{ ...BTN, opacity: slotLoading ? 0.6 : 1 }} disabled={slotLoading} onClick={handleBlockSlot}>
            {slotLoading ? "Blocking…" : "Block Time Slot"}
          </button>
        </div>
      </div>

      {/* Active blocked dates list */}
      <div style={CARD}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0e0d0b", margin: "0 0 16px" }}>
          Upcoming Blocked Dates ({blockedDates.length})
        </h2>
        {blockedDates.length === 0 ? (
          <p style={{ fontSize: 14, color: "#8a857a", margin: 0 }}>No blocked dates.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f5f0e8" }}>
                {["Dates", "Reason", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "#8a857a", fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blockedDates.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f5f0e8" }}>
                  <td style={{ padding: "12px 12px", fontWeight: 500, color: "#0e0d0b" }}>
                    {b.start_date === b.end_date ? formatDate(b.start_date) : `${formatDate(b.start_date)} – ${formatDate(b.end_date)}`}
                  </td>
                  <td style={{ padding: "12px 12px", color: "#8a857a" }}>{b.reason ?? "—"}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right" }}>
                    <button style={BTN_DANGER} onClick={() => handleDeleteDate(b.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Active blocked time slots list */}
      <div style={CARD}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0e0d0b", margin: "0 0 16px" }}>
          Upcoming Blocked Time Slots ({blockedSlots.length})
        </h2>
        {blockedSlots.length === 0 ? (
          <p style={{ fontSize: 14, color: "#8a857a", margin: 0 }}>No blocked time slots.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f5f0e8" }}>
                {["Date", "Time", "Reason", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "#8a857a", fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blockedSlots.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f5f0e8" }}>
                  <td style={{ padding: "12px 12px", fontWeight: 500, color: "#0e0d0b" }}>{formatDate(s.slot_date)}</td>
                  <td style={{ padding: "12px 12px", color: "#3a3a34" }}>{s.start_time} – {s.end_time}</td>
                  <td style={{ padding: "12px 12px", color: "#8a857a" }}>{s.reason ?? "—"}</td>
                  <td style={{ padding: "12px 12px", textAlign: "right" }}>
                    <button style={BTN_DANGER} onClick={() => handleDeleteSlot(s.id)}>Remove</button>
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
