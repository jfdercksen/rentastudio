import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendModificationEmail } from "@/lib/resend/send-modification-email";

const DURATION_HOURS: Record<string, number> = {
  hourly: 1,
  half_day: 4,
  full_day: 13,
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

function slotsOverlap(
  s1Start: string,
  s1End: string,
  s2Start: string,
  s2End: string
): boolean {
  return (
    timeToMinutes(s2Start) < timeToMinutes(s1End) &&
    timeToMinutes(s2End) > timeToMinutes(s1Start)
  );
}

const ModifySchema = z.object({
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  newStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  newDurationType: z.enum(["hourly", "half_day", "full_day"]).optional(),
  addOnIds: z.array(z.string().uuid()).optional(),
});

async function resolveToken(token: string) {
  const supabase = createAdminClient();
  const { data: tokenRow } = await supabase
    .from("booking_access_tokens")
    .select("booking_id, expires_at")
    .eq("token", token)
    .single();

  if (!tokenRow) return { booking: null, error: "Invalid link" };

  const now = new Date();
  if (new Date(tokenRow.expires_at) < now) {
    return { booking: null, error: "This link has expired" };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, client_name, client_email, booking_date, start_time, end_time, package_type, duration_type, is_weekday, add_ons, subtotal, deposit_amount, total_amount, final_total, status, shoot_type"
    )
    .eq("id", tokenRow.booking_id)
    .single();

  return { booking, error: null };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const { token } = await params;
    const { booking, error } = await resolveToken(token);

    if (error || !booking) {
      return NextResponse.json({ error: error ?? "Not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // Fetch available add-ons so the portal can offer upgrades
    const supabase = createAdminClient();
    const { data: addOns } = await supabase
      .from("add_ons")
      .select("id, name, description, price_rands")
      .eq("is_active", true)
      .order("display_order");

    const bookingDate = booking.booking_date as string;
    const today = new Date().toISOString().split("T")[0];
    const isPast = bookingDate < today;
    const isModifiable = booking.status === "confirmed" && !isPast;

    return NextResponse.json({
      booking: {
        id: booking.id,
        clientName: booking.client_name,
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        packageType: booking.package_type,
        durationType: booking.duration_type,
        isWeekday: booking.is_weekday,
        addOns: booking.add_ons,
        subtotal: booking.subtotal,
        depositAmount: booking.deposit_amount,
        totalAmount: booking.final_total ?? booking.total_amount,
        status: booking.status,
        shootType: booking.shoot_type,
      },
      availableAddOns: addOns ?? [],
      isModifiable,
      isPast,
    });
  } catch (err) {
    console.error("[booking/manage/GET] error:", err);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const { token } = await params;
    const { booking, error } = await resolveToken(token);

    if (error || !booking) {
      return NextResponse.json({ error: error ?? "Not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json({ error: "Only confirmed bookings can be modified", code: "FORBIDDEN" }, { status: 403 });
    }

    const bookingDate = booking.booking_date as string;
    const today = new Date().toISOString().split("T")[0];
    if (bookingDate < today) {
      return NextResponse.json({ error: "Past bookings cannot be modified", code: "FORBIDDEN" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const parsed = ModifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const changes = parsed.data;
    if (!changes.newDate && !changes.newStartTime && !changes.newDurationType && !changes.addOnIds) {
      return NextResponse.json({ error: "No changes provided", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Resolve new date/time/duration — fall back to current values
    const targetDate = changes.newDate ?? (booking.booking_date as string);
    const targetStart = changes.newStartTime ?? (booking.start_time as string);
    const targetDuration = changes.newDurationType ?? (booking.duration_type as string);
    const targetEnd = minutesToTime(
      timeToMinutes(targetStart) + DURATION_HOURS[targetDuration] * 60
    );
    const targetWeekday = (() => {
      const d = new Date(targetDate + "T00:00:00");
      const day = d.getDay();
      return day >= 1 && day <= 4;
    })();

    // Check for conflicts if date/time/duration changed (exclude current booking)
    const dateOrTimeChanged =
      changes.newDate !== undefined ||
      changes.newStartTime !== undefined ||
      changes.newDurationType !== undefined;

    if (dateOrTimeChanged) {
      const targetDateObj = new Date(targetDate + "T00:00:00");
      const todayObj = new Date(today + "T00:00:00");
      if (targetDateObj < todayObj) {
        return NextResponse.json({ error: "Cannot reschedule to a past date", code: "VALIDATION_ERROR" }, { status: 400 });
      }

      // Check blocked dates
      const { data: blockedDates } = await supabase
        .from("blocked_dates")
        .select("id")
        .lte("start_date", targetDate)
        .gte("end_date", targetDate);
      if (blockedDates && blockedDates.length > 0) {
        return NextResponse.json({ error: "That date is unavailable", code: "CONFLICT" }, { status: 409 });
      }

      // Check blocked time slots
      const { data: blockedSlots } = await supabase
        .from("blocked_time_slots")
        .select("start_time, end_time")
        .eq("slot_date", targetDate);
      const hasSlotConflict = (blockedSlots ?? []).some((s) =>
        slotsOverlap(targetStart, targetEnd, s.start_time, s.end_time)
      );
      if (hasSlotConflict) {
        return NextResponse.json({ error: "That time slot is unavailable", code: "CONFLICT" }, { status: 409 });
      }

      // Check existing bookings (exclude the current one)
      const { data: conflictsRaw } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("booking_date", targetDate)
        .in("status", ["confirmed", "pending"])
        .neq("id", booking.id);

      const hasBookingConflict = (conflictsRaw ?? []).some((b) =>
        slotsOverlap(targetStart, targetEnd, b.start_time, b.end_time)
      );
      if (hasBookingConflict) {
        return NextResponse.json({ error: "That time slot is already booked", code: "CONFLICT" }, { status: 409 });
      }
    }

    // Resolve add-ons
    let newAddOnNames: string[] = (booking.add_ons as string[]) ?? [];
    let addOnsSubtotal = 0;

    if (changes.addOnIds !== undefined) {
      if (changes.addOnIds.length > 0) {
        const { data: addOnRows } = await supabase
          .from("add_ons")
          .select("id, name, price_rands")
          .in("id", changes.addOnIds)
          .eq("is_active", true);
        newAddOnNames = (addOnRows ?? []).map((a) => a.name);
        addOnsSubtotal = (addOnRows ?? []).reduce((sum, a) => sum + a.price_rands, 0);
      } else {
        newAddOnNames = [];
      }
    } else {
      // No change to add-ons — look up current add-on prices
      const currentAddOnNames = (booking.add_ons as string[]) ?? [];
      if (currentAddOnNames.length > 0) {
        const { data: addOnRows } = await supabase
          .from("add_ons")
          .select("name, price_rands")
          .in("name", currentAddOnNames);
        addOnsSubtotal = (addOnRows ?? []).reduce((sum, a) => sum + a.price_rands, 0);
      }
    }

    // Re-price based on new date/duration
    const { data: pricingRow } = await supabase
      .from("pricing")
      .select("price_rands")
      .eq("package_type", booking.package_type)
      .eq("duration_type", targetDuration)
      .eq("is_weekday", targetWeekday)
      .single();

    if (!pricingRow) {
      return NextResponse.json({ error: "Pricing unavailable", code: "INTERNAL_ERROR" }, { status: 500 });
    }

    const newSubtotal = pricingRow.price_rands + addOnsSubtotal;
    const deposit = booking.deposit_amount as number;
    const newTotal = newSubtotal + deposit;

    // Determine modification type
    const modificationType =
      dateOrTimeChanged && changes.addOnIds !== undefined
        ? "mixed"
        : dateOrTimeChanged
        ? "reschedule"
        : changes.newDurationType !== undefined
        ? "duration_change"
        : "add_ons";

    const oldValues = {
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      duration_type: booking.duration_type,
      add_ons: booking.add_ons,
      subtotal: booking.subtotal,
      total_amount: booking.final_total ?? booking.total_amount,
    };

    const newValues = {
      booking_date: targetDate,
      start_time: targetStart,
      end_time: targetEnd,
      duration_type: targetDuration,
      add_ons: newAddOnNames,
      subtotal: newSubtotal,
      total_amount: newTotal,
    };

    // Apply the update
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        booking_date: targetDate,
        start_time: targetStart,
        end_time: targetEnd,
        duration_type: targetDuration,
        is_weekday: targetWeekday,
        add_ons: newAddOnNames,
        subtotal: newSubtotal,
        total_amount: newTotal,
        final_total: newTotal,
      })
      .eq("id", booking.id)
      .eq("status", "confirmed");

    if (updateError) {
      console.error("[booking/manage/PATCH] update error:", updateError.message);
      return NextResponse.json({ error: "Failed to update booking", code: "INTERNAL_ERROR" }, { status: 500 });
    }

    // Log the modification
    await supabase.from("booking_modifications").insert({
      booking_id: booking.id,
      modification_type: modificationType,
      old_values: oldValues,
      new_values: newValues,
      modified_by: "customer",
    });

    // Send updated confirmation email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const manageUrl = `${siteUrl}/booking/manage/${token}`;

    await sendModificationEmail({
      clientName: booking.client_name as string,
      clientEmail: booking.client_email as string,
      bookingDate: targetDate,
      startTime: targetStart,
      endTime: targetEnd,
      packageType: booking.package_type as string,
      durationType: targetDuration,
      addOns: newAddOnNames,
      subtotal: newSubtotal,
      depositAmount: deposit,
      totalAmount: newTotal,
      manageUrl,
      modificationType,
    });

    return NextResponse.json({
      success: true,
      booking: {
        bookingDate: targetDate,
        startTime: targetStart,
        endTime: targetEnd,
        durationType: targetDuration,
        addOns: newAddOnNames,
        subtotal: newSubtotal,
        depositAmount: deposit,
        totalAmount: newTotal,
      },
    });
  } catch (err) {
    console.error("[booking/manage/PATCH] error:", err);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
