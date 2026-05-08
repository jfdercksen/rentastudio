import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import PricingEditor from "@/components/admin/PricingEditor";

export const metadata: Metadata = {
  title: "Pricing — Kyalami Studio Admin",
};

export default async function PricingPage() {
  const supabase = createAdminClient();

  const [{ data: pricing }, { data: addOns }] = await Promise.all([
    supabase.from("pricing").select("*").order("package_type").order("duration_type"),
    supabase.from("add_ons").select("*").order("display_order"),
  ]);

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 32,
          fontWeight: 300,
          letterSpacing: "-0.02em",
          color: "#0e0d0b",
          marginBottom: 8,
        }}
      >
        Pricing
      </h1>
      <p style={{ fontSize: 14, color: "#8a857a", marginBottom: 32 }}>
        Edit package prices and add-on rates. Changes are saved immediately.
      </p>

      <PricingEditor pricing={pricing ?? []} addOns={addOns ?? []} />
    </div>
  );
}
