import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BlockDateSchema = z.object({
  type: z.literal("date"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  reason: z.string().max(200).optional(),
});

const BlockSlotSchema = z.object({
  type: z.literal("slot"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().max(200).optional(),
});

const BlockSchema = z.discriminatedUnion("type", [BlockDateSchema, BlockSlotSchema]);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    const [{ data: blockedDates }, { data: blockedSlots }] = await Promise.all([
      supabase
        .from("blocked_dates")
        .select("id, start_date, end_date, reason, created_at")
        .gte("end_date", today)
        .order("start_date"),
      supabase
        .from("blocked_time_slots")
        .select("id, slot_date, start_time, end_time, reason, created_at")
        .gte("slot_date", today)
        .order("slot_date")
        .order("start_time"),
    ]);

    return NextResponse.json({
      blockedDates: blockedDates ?? [],
      blockedSlots: blockedSlots ?? [],
    });
  } catch (err) {
    console.error("[admin/availability/GET] error:", err);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const parsed = BlockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", code: "VALIDATION_ERROR", issues: parsed.error.issues }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (parsed.data.type === "date") {
      const { startDate, endDate, reason } = parsed.data;
      if (endDate < startDate) {
        return NextResponse.json({ error: "End date must be on or after start date", code: "VALIDATION_ERROR" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("blocked_dates")
        .insert({ start_date: startDate, end_date: endDate, reason: reason ?? null })
        .select("id, start_date, end_date, reason, created_at")
        .single();

      if (error) {
        console.error("[admin/availability/POST] insert blocked_date error:", error.message);
        return NextResponse.json({ error: "Failed to block date", code: "INTERNAL_ERROR" }, { status: 500 });
      }

      return NextResponse.json({ data }, { status: 201 });
    } else {
      const { date, startTime, endTime, reason } = parsed.data;
      if (endTime <= startTime) {
        return NextResponse.json({ error: "End time must be after start time", code: "VALIDATION_ERROR" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("blocked_time_slots")
        .insert({ slot_date: date, start_time: startTime, end_time: endTime, reason: reason ?? null })
        .select("id, slot_date, start_time, end_time, reason, created_at")
        .single();

      if (error) {
        console.error("[admin/availability/POST] insert blocked_slot error:", error.message);
        return NextResponse.json({ error: "Failed to block time slot", code: "INTERNAL_ERROR" }, { status: 500 });
      }

      return NextResponse.json({ data }, { status: 201 });
    }
  } catch (err) {
    console.error("[admin/availability/POST] error:", err);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
