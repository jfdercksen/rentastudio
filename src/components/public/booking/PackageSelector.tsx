"use client";

import type { PackageType, DurationType } from "@/types/booking";
import type { Database } from "@/types/database";

type PricingRow = Database["public"]["Tables"]["pricing"]["Row"];

interface PackageSelectorProps {
  pricing: PricingRow[];
  packageType: PackageType | null;
  durationType: DurationType | null;
  isWeekday: boolean;
  onPackageChange: (pkg: PackageType) => void;
  onDurationChange: (dur: DurationType) => void;
}

const PACKAGES: { value: PackageType; label: string; desc: string }[] = [
  {
    value: "studio_only",
    label: "Studio Only",
    desc: "Bring your own gear — or add equipment à la carte.",
  },
  {
    value: "all_inclusive",
    label: "All-Inclusive",
    desc: "Camera, lights, mics, teleprompter. Just show up and shoot.",
  },
];

const DURATIONS: { value: DurationType; label: string; sub: string }[] = [
  { value: "hourly", label: "Hourly", sub: "Min. 1 hour" },
  { value: "half_day", label: "Half Day", sub: "4 hours" },
  { value: "full_day", label: "Full Day", sub: "8 hours" },
];

export default function PackageSelector({
  pricing,
  packageType,
  durationType,
  isWeekday,
  onPackageChange,
  onDurationChange,
}: PackageSelectorProps) {
  function getPrice(pkg: PackageType, dur: DurationType): number | null {
    const row = pricing.find(
      (p) =>
        p.package_type === pkg &&
        p.duration_type === dur &&
        p.is_weekday === isWeekday
    );
    return row?.price_rands ?? null;
  }

  const selectedPrice =
    packageType && durationType
      ? getPrice(packageType, durationType)
      : null;

  return (
    <div>
      {/* Package type */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8a857a",
            marginBottom: 12,
          }}
        >
          Package type
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {PACKAGES.map((pkg) => {
            const isActive = packageType === pkg.value;
            return (
              <button
                key={pkg.value}
                onClick={() => onPackageChange(pkg.value)}
                style={{
                  padding: "20px",
                  borderRadius: 8,
                  border: `1px solid ${isActive ? "#0e0d0b" : "#e8e2d6"}`,
                  background: isActive ? "#0e0d0b" : "#fff",
                  color: isActive ? "#faf7f2" : "#0e0d0b",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontSize: 18,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    marginBottom: 6,
                  }}
                >
                  {pkg.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: isActive ? 0.7 : 0.6,
                    lineHeight: 1.4,
                  }}
                >
                  {pkg.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8a857a",
            marginBottom: 12,
          }}
        >
          Duration
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {DURATIONS.map((dur) => {
            const price =
              packageType ? getPrice(packageType, dur.value) : null;
            const isActive = durationType === dur.value;
            return (
              <button
                key={dur.value}
                onClick={() => onDurationChange(dur.value)}
                style={{
                  padding: "16px 12px",
                  borderRadius: 8,
                  border: `1px solid ${isActive ? "#c8984a" : "#e8e2d6"}`,
                  background: isActive ? "#f3e6cb" : "#fff",
                  color: "#0e0d0b",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontSize: 16,
                    fontWeight: 400,
                    marginBottom: 4,
                  }}
                >
                  {dur.label}
                </div>
                <div style={{ fontSize: 11, color: "#8a857a", marginBottom: 8 }}>
                  {dur.sub}
                </div>
                {price !== null ? (
                  <div
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 18,
                      fontWeight: 500,
                      color: isActive ? "#a87d36" : "#0e0d0b",
                    }}
                  >
                    R{price.toLocaleString()}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "#d4cbb8" }}>
                    — Select package
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected price summary */}
      {selectedPrice !== null && (
        <div
          style={{
            padding: "16px 20px",
            background: "#f5f0e8",
            borderRadius: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 14, color: "#3a3a34" }}>
            {isWeekday ? "Weekday" : "Weekend"} rate
          </span>
          <span
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 22,
              fontWeight: 500,
              color: "#a87d36",
            }}
          >
            R{selectedPrice.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
