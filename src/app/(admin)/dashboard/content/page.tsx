import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import ContentEditor from "@/components/admin/ContentEditor";

export const metadata: Metadata = {
  title: "Content — Kyalami Studio Admin",
};

export default async function ContentPage() {
  const supabase = createAdminClient();
  const { data: rows } = await supabase.from("site_content").select("key, value");

  const content = (rows ?? []).reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

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
        Content
      </h1>
      <p style={{ fontSize: 14, color: "#8a857a", marginBottom: 32 }}>
        Edit site content. Each section saves independently.
      </p>

      <ContentEditor initialContent={content} />
    </div>
  );
}
