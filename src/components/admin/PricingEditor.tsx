"use client";

import { useState } from "react";
import type { Database } from "@/types/database";

type PricingRow = Database["public"]["Tables"]["pricing"]["Row"];
type AddOnRow = Database["public"]["Tables"]["add_ons"]["Row"];

interface PricingEditorProps {
  pricing: PricingRow[];
  addOns: AddOnRow[];
}

const PACKAGE_LABELS: Record<string, string> = {
  studio_only: "Studio Only",
  all_inclusive: "All-Inclusive",
};

const DURATION_ORDER = ["hourly", "half_day", "full_day"];
const DURATION_LABELS: Record<string, string> = {
  hourly: "Hourly",
  half_day: "Half Day (4 hrs)",
  full_day: "Full Day (13 hrs)",
};

interface EditingCell {
  id: string;
  value: string;
}

export default function PricingEditor({ pricing, addOns }: PricingEditorProps) {
  const [prices, setPrices] = useState<PricingRow[]>(pricing);
  const [addOnList, setAddOnList] = useState<AddOnRow[]>(addOns);
  const [editingPrice, setEditingPrice] = useState<EditingCell | null>(null);
  const [editingAddOn, setEditingAddOn] = useState<EditingCell | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const packageTypes = Array.from(new Set(prices.map((p) => p.package_type)));

  async function savePrice(id: string, newValue: string) {
    const num = parseFloat(newValue);
    if (isNaN(num) || num <= 0) {
      setError("Price must be a positive number.");
      // Revert
      setEditingPrice(null);
      return;
    }

    setSaving(id);
    setError(null);
    // Optimistic update
    const prev = prices.find((p) => p.id === id)?.price_rands;
    setPrices((rows) =>
      rows.map((p) => (p.id === id ? { ...p, price_rands: num } : p))
    );
    setEditingPrice(null);

    const res = await fetch(`/api/admin/pricing/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price_rands: num }),
    });

    if (!res.ok) {
      // Revert
      setPrices((rows) =>
        rows.map((p) =>
          p.id === id ? { ...p, price_rands: prev ?? p.price_rands } : p
        )
      );
      setError("Failed to save price. Please try again.");
    }
    setSaving(null);
  }

  async function saveAddOnPrice(id: string, newValue: string) {
    const num = parseFloat(newValue);
    if (isNaN(num) || num <= 0) {
      setError("Price must be a positive number.");
      setEditingAddOn(null);
      return;
    }

    setSaving(id);
    setError(null);
    const prev = addOnList.find((a) => a.id === id)?.price_rands;
    setAddOnList((rows) =>
      rows.map((a) => (a.id === id ? { ...a, price_rands: num } : a))
    );
    setEditingAddOn(null);

    const res = await fetch(`/api/admin/add-ons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price_rands: num }),
    });

    if (!res.ok) {
      setAddOnList((rows) =>
        rows.map((a) =>
          a.id === id ? { ...a, price_rands: prev ?? a.price_rands } : a
        )
      );
      setError("Failed to save add-on price.");
    }
    setSaving(null);
  }

  async function toggleAddOn(id: string, currentActive: boolean) {
    setSaving(id);
    setAddOnList((rows) =>
      rows.map((a) => (a.id === id ? { ...a, is_active: !currentActive } : a))
    );

    const res = await fetch(`/api/admin/add-ons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !currentActive }),
    });

    if (!res.ok) {
      setAddOnList((rows) =>
        rows.map((a) => (a.id === id ? { ...a, is_active: currentActive } : a))
      );
      setError("Failed to toggle add-on.");
    }
    setSaving(null);
  }

  function getPrice(packageType: string, durationType: string, isWeekday: boolean) {
    return prices.find(
      (p) =>
        p.package_type === packageType &&
        p.duration_type === durationType &&
        p.is_weekday === isWeekday
    );
  }

  function PriceCell({
    row,
    isWeekday,
  }: {
    row: PricingRow | undefined;
    isWeekday: boolean;
  }) {
    if (!row) return <td style={{ padding: "12px 20px" }}>—</td>;
    const isEditing = editingPrice?.id === row.id;
    const isSaving = saving === row.id;

    return (
      <td style={{ padding: "12px 20px", fontSize: 14 }}>
        {isEditing ? (
          <input
            type="number"
            min="0"
            step="0.01"
            defaultValue={editingPrice?.value ?? ""}
            autoFocus
            onBlur={(e) => savePrice(row.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") savePrice(row.id, (e.target as HTMLInputElement).value);
              if (e.key === "Escape") setEditingPrice(null);
            }}
            style={{
              width: 100,
              padding: "4px 8px",
              border: "1px solid #c8984a",
              borderRadius: 4,
              fontSize: 14,
              outline: "none",
            }}
          />
        ) : (
          <span
            onClick={() =>
              !isSaving &&
              setEditingPrice({ id: row.id, value: String(row.price_rands) })
            }
            style={{
              cursor: isSaving ? "wait" : "pointer",
              color: "#0e0d0b",
              fontWeight: 500,
              padding: "4px 8px",
              borderRadius: 4,
              background: isSaving ? "#f5f0e8" : "transparent",
              display: "inline-block",
              minWidth: 80,
              borderBottom: "1px dashed #c8984a",
            }}
            title="Click to edit"
          >
            R{row.price_rands.toFixed(2)}
          </span>
        )}
      </td>
    );
  }

  return (
    <div>
      {error && (
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
          {error}
        </div>
      )}

      <p style={{ fontSize: 13, color: "#8a857a", marginBottom: 24 }}>
        Click any price to edit it inline. Changes save on blur or Enter.
      </p>

      {/* Package pricing tables */}
      {packageTypes.map((pkg) => (
        <div
          key={pkg}
          style={{
            background: "#fff",
            border: "1px solid #e8e2d6",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              background: "#f5f0e8",
              borderBottom: "1px solid #e8e2d6",
              fontWeight: 600,
              fontSize: 15,
              color: "#0e0d0b",
            }}
          >
            {PACKAGE_LABELS[pkg] ?? pkg}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e8e2d6" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a857a" }}>
                  Duration
                </th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a857a" }}>
                  Weekday (Mon–Thu)
                </th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a857a" }}>
                  Weekend (Fri–Sun)
                </th>
              </tr>
            </thead>
            <tbody>
              {DURATION_ORDER.map((dur) => {
                const weekdayRow = getPrice(pkg, dur, true);
                const weekendRow = getPrice(pkg, dur, false);
                return (
                  <tr key={dur} style={{ borderBottom: "1px solid #f5f0e8" }}>
                    <td style={{ padding: "12px 20px", fontSize: 14, color: "#3a3a34" }}>
                      {DURATION_LABELS[dur] ?? dur}
                    </td>
                    <PriceCell row={weekdayRow} isWeekday={true} />
                    <PriceCell row={weekendRow} isWeekday={false} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {/* Add-ons */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e2d6",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            background: "#f5f0e8",
            borderBottom: "1px solid #e8e2d6",
            fontWeight: 600,
            fontSize: 15,
            color: "#0e0d0b",
          }}
        >
          Add-ons
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e8e2d6" }}>
              {["Name", "Price", "Active"].map((h) => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a857a" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {addOnList.map((addon) => {
              const isEditing = editingAddOn?.id === addon.id;
              const isSaving = saving === addon.id;

              return (
                <tr key={addon.id} style={{ borderBottom: "1px solid #f5f0e8" }}>
                  <td style={{ padding: "12px 20px", fontSize: 14, color: "#0e0d0b", fontWeight: 500 }}>
                    {addon.name}
                  </td>
                  <td style={{ padding: "12px 20px", fontSize: 14 }}>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={editingAddOn?.value ?? ""}
                        autoFocus
                        onBlur={(e) => saveAddOnPrice(addon.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveAddOnPrice(addon.id, (e.target as HTMLInputElement).value);
                          if (e.key === "Escape") setEditingAddOn(null);
                        }}
                        style={{
                          width: 100,
                          padding: "4px 8px",
                          border: "1px solid #c8984a",
                          borderRadius: 4,
                          fontSize: 14,
                          outline: "none",
                        }}
                      />
                    ) : (
                      <span
                        onClick={() =>
                          !isSaving &&
                          setEditingAddOn({ id: addon.id, value: String(addon.price_rands) })
                        }
                        style={{
                          cursor: isSaving ? "wait" : "pointer",
                          color: "#0e0d0b",
                          fontWeight: 500,
                          padding: "4px 8px",
                          borderRadius: 4,
                          display: "inline-block",
                          minWidth: 80,
                          borderBottom: "1px dashed #c8984a",
                        }}
                        title="Click to edit"
                      >
                        R{addon.price_rands.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <button
                      onClick={() => toggleAddOn(addon.id, addon.is_active)}
                      disabled={isSaving}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: isSaving ? "wait" : "pointer",
                        border: "none",
                        background: addon.is_active ? "#d1fae5" : "#f3f4f6",
                        color: addon.is_active ? "#065f46" : "#374151",
                      }}
                    >
                      {addon.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
