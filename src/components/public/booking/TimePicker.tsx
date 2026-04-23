"use client";

import type { TimeSlot, DurationType } from "@/types/booking";

interface TimePickerProps {
  slots: TimeSlot[];
  durationType: DurationType | null;
  value: TimeSlot | null;
  onChange: (slot: TimeSlot) => void;
}

const DURATION_HOURS: Record<DurationType, number> = {
  hourly: 1,
  half_day: 4,
  full_day: 8,
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function TimePicker({
  slots,
  durationType,
  value,
  onChange,
}: TimePickerProps) {
  if (slots.length === 0) {
    return (
      <p style={{ fontSize: 14, color: "#8a857a", fontStyle: "italic" }}>
        No availability for this date.
      </p>
    );
  }

  const durationHours = durationType ? DURATION_HOURS[durationType] : 1;

  // Determine which start times are bookable for the full duration
  const bookableSlots: (TimeSlot & { endTime: string })[] = slots
    .filter((slot) => {
      const startMin = timeToMinutes(slot.start);
      const endMin = startMin + durationHours * 60;
      if (endMin > 21 * 60) return false; // Doesn't fit before closing
      // Check all 1-hour blocks in this range are available
      return slots
        .filter((s) => {
          const sm = timeToMinutes(s.start);
          return sm >= startMin && sm < endMin;
        })
        .every((s) => s.available);
    })
    .map((slot) => ({
      ...slot,
      endTime: minutesToTime(timeToMinutes(slot.start) + durationHours * 60),
    }));

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 8,
        }}
      >
        {slots.map((slot) => {
          const startMin = timeToMinutes(slot.start);
          const endMin = startMin + durationHours * 60;
          const fitsInHours = endMin <= 21 * 60;
          const bookable = bookableSlots.some((b) => b.start === slot.start);
          const isSelected = value?.start === slot.start;
          const isDisabled = !bookable;

          return (
            <button
              key={slot.start}
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  const endTime = minutesToTime(startMin + durationHours * 60);
                  onChange({ start: slot.start, end: endTime, available: true });
                }
              }}
              style={{
                padding: "12px 8px",
                borderRadius: 6,
                border: `1px solid ${isSelected ? "#0e0d0b" : "#e8e2d6"}`,
                background: isSelected ? "#0e0d0b" : isDisabled ? "#faf7f2" : "#fff",
                color: isSelected ? "#faf7f2" : isDisabled ? "#d4cbb8" : "#0e0d0b",
                fontSize: 13,
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                cursor: isDisabled ? "not-allowed" : "pointer",
                textDecoration: !fitsInHours || !slot.available ? "line-through" : "none",
                transition: "all 0.15s",
                textAlign: "center",
              }}
            >
              {slot.start}
              {isSelected && (
                <span style={{ display: "block", fontSize: 10, opacity: 0.7 }}>
                  – {minutesToTime(startMin + durationHours * 60)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {durationType && durationType !== "hourly" && (
        <p style={{ marginTop: 12, fontSize: 12, color: "#8a857a" }}>
          Select a start time — end time is calculated automatically (
          {durationHours} hours).
        </p>
      )}
    </div>
  );
}
