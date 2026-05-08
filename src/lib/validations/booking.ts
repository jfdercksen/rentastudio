import { z } from "zod";

export const BookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  packageType: z.enum(["studio_only", "all_inclusive"]),
  durationType: z.enum(["hourly", "half_day", "full_day"]),
  isWeekday: z.boolean(),
  addOnIds: z.array(z.string().uuid()).default([]),
  clientName: z.string().min(2).max(100),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(7).max(20),
  shootType: z.string().min(2).max(500),
  idDocumentBase64: z.string().nullable().optional(),
  idDocumentName: z.string().nullable().optional(),
  bankHolderName: z.string().min(2).max(100),
  bankName: z.string().min(2).max(100),
  accountNumber: z.string().regex(/^\d+$/, "Digits only").min(8).max(16),
  branchCode: z.string().min(2).max(20),
  promoCode: z.string().min(1).max(50).optional().nullable(),
});

export type BookingInput = z.infer<typeof BookingSchema>;
