import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import GalleryManager from "@/components/admin/GalleryManager";

export const metadata: Metadata = {
  title: "Gallery — Kyalami Studio Admin",
};

export default async function GalleryPage() {
  const supabase = createAdminClient();
  const { data: images } = await supabase
    .from("gallery_images")
    .select("*")
    .order("display_order");

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
        Gallery
      </h1>
      <p style={{ fontSize: 14, color: "#8a857a", marginBottom: 32 }}>
        Upload images, edit alt text, drag to reorder, and delete.
      </p>

      <GalleryManager initialImages={images ?? []} />
    </div>
  );
}
