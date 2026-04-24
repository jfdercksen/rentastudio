"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { Database } from "@/types/database";

type GalleryImage = Database["public"]["Tables"]["gallery_images"]["Row"];

interface GalleryManagerProps {
  initialImages: GalleryImage[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function GalleryManager({ initialImages }: GalleryManagerProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState<{ id: string; value: string } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploadError(null);

    const invalid = files.filter(
      (f) => !f.type.startsWith("image/") || f.size > MAX_FILE_SIZE
    );
    if (invalid.length > 0) {
      setUploadError(
        `${invalid.length} file(s) rejected: must be images under 5MB.`
      );
      // Upload only the valid ones
    }

    const valid = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_FILE_SIZE
    );
    if (valid.length === 0) return;

    setUploading(true);
    try {
      for (const file of valid) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt_text", file.name.replace(/\.[^.]+$/, ""));

        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = (await res.json()) as { image: GalleryImage };
          setImages((prev) => [...prev, json.image]);
        } else {
          setUploadError("One or more uploads failed.");
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAltSave(id: string, value: string) {
    setEditingAlt(null);
    const prev = images.find((i) => i.id === id)?.alt_text;
    setImages((imgs) =>
      imgs.map((i) => (i.id === id ? { ...i, alt_text: value } : i))
    );

    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt_text: value }),
    });

    if (!res.ok) {
      setImages((imgs) =>
        imgs.map((i) => (i.id === id ? { ...i, alt_text: prev ?? "" } : i))
      );
      setUploadError("Failed to save alt text.");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this image? It will be removed from the gallery permanently."
    );
    if (!confirmed) return;

    setImages((imgs) => imgs.filter((i) => i.id !== id));

    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (!res.ok) {
      // Restore — refetch to get accurate state
      const fetchRes = await fetch("/api/admin/gallery");
      if (fetchRes.ok) {
        const json = (await fetchRes.json()) as { images: GalleryImage[] };
        setImages(json.images);
      }
      setUploadError("Failed to delete image.");
    }
  }

  function handleDragStart(id: string) {
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  async function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const newImages = [...images];
    const fromIdx = newImages.findIndex((i) => i.id === draggedId);
    const toIdx = newImages.findIndex((i) => i.id === targetId);
    const [moved] = newImages.splice(fromIdx, 1);
    newImages.splice(toIdx, 0, moved);

    const reordered = newImages.map((img, idx) => ({
      ...img,
      display_order: idx,
    }));
    setImages(reordered);
    setDraggedId(null);
    setDragOverId(null);

    await fetch("/api/admin/gallery/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: reordered.map((i) => ({ id: i.id, display_order: i.display_order })),
      }),
    });
  }

  return (
    <div>
      {/* Upload area */}
      <div
        style={{
          background: "#fff",
          border: "2px dashed #e8e2d6",
          borderRadius: 10,
          padding: "32px",
          textAlign: "center",
          marginBottom: 28,
          cursor: "pointer",
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
        <div style={{ fontSize: 14, color: "#3a3a34", fontWeight: 500, marginBottom: 4 }}>
          {uploading ? "Uploading…" : "Click to upload images"}
        </div>
        <div style={{ fontSize: 12, color: "#8a857a" }}>
          JPEG, PNG, WebP · Max 5MB each · Multiple files allowed
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </div>

      {uploadError && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fee2e2",
            color: "#7f1d1d",
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          {uploadError}
        </div>
      )}

      {/* Image grid */}
      {images.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#8a857a",
            fontSize: 14,
          }}
        >
          No gallery images yet. Upload some above.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {images.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(img.id)}
              onDragOver={(e) => handleDragOver(e, img.id)}
              onDrop={() => handleDrop(img.id)}
              onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
              style={{
                background: "#fff",
                border: dragOverId === img.id ? "2px solid #c8984a" : "1px solid #e8e2d6",
                borderRadius: 8,
                overflow: "hidden",
                opacity: draggedId === img.id ? 0.5 : 1,
                cursor: "grab",
              }}
            >
              <div style={{ position: "relative", aspectRatio: "4/3" }}>
                <Image
                  src={img.url}
                  alt={img.alt_text}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div style={{ padding: "12px" }}>
                {editingAlt?.id === img.id ? (
                  <input
                    type="text"
                    defaultValue={editingAlt.value}
                    autoFocus
                    onBlur={(e) => handleAltSave(img.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAltSave(img.id, (e.target as HTMLInputElement).value);
                      if (e.key === "Escape") setEditingAlt(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "4px 8px",
                      border: "1px solid #c8984a",
                      borderRadius: 4,
                      fontSize: 12,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <div
                    onClick={() => setEditingAlt({ id: img.id, value: img.alt_text })}
                    style={{
                      fontSize: 12,
                      color: "#3a3a34",
                      cursor: "text",
                      padding: "4px 0",
                      borderBottom: "1px dashed #c8984a",
                      marginBottom: 8,
                      minHeight: 20,
                    }}
                    title="Click to edit alt text"
                  >
                    {img.alt_text || <span style={{ color: "#c8984a" }}>+ Add alt text</span>}
                  </div>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  style={{
                    padding: "4px 10px",
                    background: "#fee2e2",
                    color: "#7f1d1d",
                    border: "none",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
