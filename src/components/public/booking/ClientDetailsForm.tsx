"use client";

import { useState } from "react";
import type { ClientDetails } from "@/types/booking";

interface ClientDetailsFormProps {
  value: ClientDetails;
  onChange: (v: ClientDetails) => void;
}

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <label
      style={{
        fontFamily: "var(--font-ibm-plex-mono), monospace",
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#3a3a34",
        display: "block",
        marginBottom: 8,
        fontWeight: 500,
      }}
    >
      {children}
      {required && (
        <span style={{ color: "#c75a3c", marginLeft: 2 }}>*</span>
      )}
    </label>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid #e8e2d6",
  borderRadius: 6,
  background: "#faf7f2",
  fontFamily: "var(--font-inter), sans-serif",
  fontSize: 14,
  color: "#0e0d0b",
  outline: "none",
  boxSizing: "border-box",
};

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#c75a3c",
  marginTop: 4,
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function validateField(field: string, val: string): string {
  if (field === "clientName" && val.trim().length < 2) return "Enter your full name";
  if (field === "clientEmail" && !val.includes("@")) return "Enter a valid email";
  if (field === "clientPhone" && val.trim().length < 7) return "Enter a valid phone number";
  if (field === "shootType" && val.trim().length < 2) return "Describe your shoot";
  return "";
}

export default function ClientDetailsForm({
  value,
  onChange,
}: ClientDetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fileError, setFileError] = useState<string | null>(null);

  function handle(field: "clientName" | "clientEmail" | "clientPhone" | "shootType", val: string) {
    onChange({ ...value, [field]: val });
    if (touched[field]) {
      setErrors((e) => ({ ...e, [field]: validateField(field, val) }));
    }
  }

  function blur(field: "clientName" | "clientEmail" | "clientPhone" | "shootType") {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({
      ...e,
      [field]: validateField(field, String(value[field] ?? "")),
    }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <FieldLabel required>Full Name</FieldLabel>
        <input
          value={value.clientName}
          onChange={(e) => handle("clientName", e.target.value)}
          onBlur={() => blur("clientName")}
          placeholder="John Doe"
          style={fieldStyle}
        />
        {touched.clientName && errors.clientName && (
          <p style={errorStyle}>{errors.clientName}</p>
        )}
      </div>

      <div className="booking-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <FieldLabel required>Email</FieldLabel>
          <input
            value={value.clientEmail}
            onChange={(e) => handle("clientEmail", e.target.value)}
            onBlur={() => blur("clientEmail")}
            type="email"
            placeholder="you@example.com"
            style={fieldStyle}
          />
          {touched.clientEmail && errors.clientEmail && (
            <p style={errorStyle}>{errors.clientEmail}</p>
          )}
        </div>
        <div>
          <FieldLabel required>Phone</FieldLabel>
          <input
            value={value.clientPhone}
            onChange={(e) => handle("clientPhone", e.target.value)}
            onBlur={() => blur("clientPhone")}
            type="tel"
            placeholder="082 000 0000"
            style={fieldStyle}
          />
          {touched.clientPhone && errors.clientPhone && (
            <p style={errorStyle}>{errors.clientPhone}</p>
          )}
        </div>
      </div>

      <div>
        <FieldLabel required>Type of Shoot / Project Description</FieldLabel>
        <textarea
          value={value.shootType}
          onChange={(e) => handle("shootType", e.target.value)}
          onBlur={() => blur("shootType")}
          placeholder="e.g. YouTube interview series, corporate video, product photography..."
          rows={3}
          style={{ ...fieldStyle, resize: "vertical" }}
        />
        {touched.shootType && errors.shootType && (
          <p style={errorStyle}>{errors.shootType}</p>
        )}
      </div>

      <div>
        <FieldLabel required>Passport or ID Document</FieldLabel>
        <p style={{ fontSize: 12, color: "#8a857a", marginBottom: 8, lineHeight: 1.5 }}>
          Required for identity verification. Securely stored, used only for booking confirmation. Max 5MB.
        </p>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file && file.size > MAX_FILE_BYTES) {
              setFileError("File is too large. Please upload an image or PDF under 5MB.");
              e.target.value = "";
              onChange({ ...value, idDocumentFile: null });
              return;
            }
            setFileError(null);
            onChange({ ...value, idDocumentFile: file });
          }}
          style={{ ...fieldStyle, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}
        />
        {fileError && <p style={errorStyle}>{fileError}</p>}
      </div>
    </div>
  );
}
