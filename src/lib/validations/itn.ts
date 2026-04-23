import { z } from "zod";

export const ITNPayloadSchema = z.object({
  m_payment_id: z.string().min(1),
  pf_payment_id: z.string().min(1),
  payment_status: z.string().min(1),
  item_name: z.string().min(1),
  item_description: z.string().optional(),
  amount_gross: z.string().min(1),
  amount_fee: z.string().min(1),
  amount_net: z.string().min(1),
  custom_str1: z.string().optional(),
  custom_str2: z.string().optional(),
  custom_str3: z.string().optional(),
  custom_str4: z.string().optional(),
  custom_str5: z.string().optional(),
  custom_int1: z.string().optional(),
  custom_int2: z.string().optional(),
  custom_int3: z.string().optional(),
  custom_int4: z.string().optional(),
  custom_int5: z.string().optional(),
  name_first: z.string().optional(),
  name_last: z.string().optional(),
  email_address: z.string().optional(),
  merchant_id: z.string().min(1),
  signature: z.string().min(1),
  token: z.string().optional(),
});

export type ITNPayload = z.infer<typeof ITNPayloadSchema>;
