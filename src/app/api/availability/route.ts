import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TimeSlot } from "@/types/booking";

// Studio hours: 07:00–21:00 — 14 one-hour slots
function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = 7; hour <= 20; hour++) {
    const start = `${String(hour).padStart(2, "0")}:00`;
    const end = `${String(hour + 1).padStart(2, "0")}:00`;
    slots.push({ start, end, available: true });
  }
  return slots;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function slotsOverlap(
  slotStart: string,
  slotEnd: string,
  bookingStart: string,
  bookingEnd: string
): boolean {
  const ss = timeToMinutes(slotStart);
  const se = timeToMinutes(slotEnd);
  const bs = timeToMinutes(bookingStart);
  const be = timeToMinutes(bookingEnd);
  return bs < se && be > ss;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const requested = new Date(date + "T00:00:00");
  if (requested < today) {
    return NextResponse.json({ error: "Date is in the past" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: blocked } = await supabase
    .from("blocked_dates")
    .select("start_date, end_date")
    .lte("start_date", date)
    .gte("end_date", date);

  if (blocked && blocked.length > 0) {
    return NextResponse.json({ slots: [], blocked: true });
  }

  const { data: bookingsRaw } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("booking_date", date)
    .in("status", ["confirmed", "pending"]);

  const bookings = (bookingsRaw ?? []) as { start_time: string; end_time: string }[];

  const slots = generateSlots().map((slot) => {
    if (bookings.length === 0) return slot;
    const isTaken = bookings.some((b) =>
      slotsOverlap(slot.start, slot.end, b.start_time, b.end_time)
    );
    return { ...slot, available: !isTaken };
  });

  return NextResponse.json({ slots, blocked: false });
}
