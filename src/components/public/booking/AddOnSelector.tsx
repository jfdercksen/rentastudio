"use client";

import type { Database } from "@/types/database";

type AddOnItem = Database["public"]["Tables"]["add_ons"]["Row"];

interface AddOnSelectorProps {
  addOns: AddOnItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function AddOnSelector({
  addOns,
  selectedIds,
  onChange,
}: AddOnSelectorProps) {
  if (addOns.length === 0) return null;

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  const total = addOns
    .filter((a) => selectedIds.includes(a.id))
    .reduce((sum, a) => sum + a.price_rands, 0);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {addOns.map((addon) => {
          const checked = selectedIds.includes(addon.id);
          return (
            <label
              key={addon.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                border: `1px solid ${checked ? "#a87d36" : "#e8e2d6"}`,
                borderRadius: 6,
                background: checked ? "#fff" : "#faf7f2",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: checked ? "0 0 0 2px #f3e6cb" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(addon.id)}
                  style={{ accentColor: "#a87d36", width: 16, height: 16 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0e0d0b" }}>
                    {addon.name}
                  </div>
                  {addon.description && (
                    <div style={{ fontSize: 12, color: "#8a857a", marginTop: 2 }}>
                      {addon.description}
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#a87d36",
                  whiteSpace: "nowrap",
                  marginLeft: 16,
                }}
              >
                +R{addon.price_rands.toLocaleString()}
              </div>
            </label>
          );
        })}
      </div>
      {total > 0 && (
        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            color: "#3a3a34",
            fontFamily: "var(--font-ibm-plex-mono), monospace",
          }}
        >
          Add-ons total: R{total.toLocaleString()}
        </p>
      )}
    </div>
  );
}
