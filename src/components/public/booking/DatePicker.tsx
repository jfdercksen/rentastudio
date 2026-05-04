"use client";

import { useState } from "react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(value + "T00:00:00") : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function selectDay(day: number) {
    const d = new Date(year, month, day);
    if (d < today) return;
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(iso);
  }

  function isoFromDay(day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const canGoPrev =
    new Date(year, month - 1, 1) >= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e2d6",
        borderRadius: 8,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #e8e2d6",
        }}
      >
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          style={{
            background: "none",
            border: "1px solid #e8e2d6",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: canGoPrev ? "pointer" : "not-allowed",
            opacity: canGoPrev ? 1 : 0.3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 18,
            fontWeight: 400,
            letterSpacing: "-0.01em",
            color: "#0e0d0b",
          }}
        >
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: "none",
            border: "1px solid #e8e2d6",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          padding: "8px 12px 4px",
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8a857a",
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          padding: "0 12px 16px",
          gap: 2,
        }}
      >
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const iso = isoFromDay(day);
          const cellDate = new Date(year, month, day);
          const isPast = cellDate < today;
          const isSelected = iso === value;

          return (
            <button
              key={iso}
              onClick={() => selectDay(day)}
              disabled={isPast}
              style={{
                padding: "10px 4px",
                borderRadius: 6,
                border: "none",
                cursor: isPast ? "not-allowed" : "pointer",
                background: isSelected ? "#0e0d0b" : "transparent",
                color: isSelected ? "#faf7f2" : isPast ? "#d4cbb8" : "#0e0d0b",
                fontSize: 13,
                fontWeight: isSelected ? 600 : 400,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isPast && !isSelected)
                  (e.currentTarget as HTMLElement).style.background = "#f5f0e8";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
              aria-label={iso}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
