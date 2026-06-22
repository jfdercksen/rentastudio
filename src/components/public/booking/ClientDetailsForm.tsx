"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import type { ClientDetails } from "@/types/booking";

const ClientSchema = z.object({
  clientName: z.string().min(2, "Enter your full name"),
  clientEmail: z.string().email("Enter a valid email"),
  clientPhone: z.string().min(7, "Enter a valid phone number"),
  shootType: z.string().min(2, "Describe your shoot"),
});

type ClientFormValues = z.infer<typeof ClientSchema>;

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

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB — base64 overhead keeps total under Vercel's 4.5MB body limit

export default function ClientDetailsForm({
  value,
  onChange,
}: ClientDetailsFormProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(ClientSchema),
    defaultValues: {
      clientName: value.clientName,
      clientEmail: value.clientEmail,
      clientPhone: value.clientPhone,
      shootType: value.shootType,
    },
    mode: "onChange",
  });

  function pushToParent(patch: Partial<ClientFormValues>) {
    const current = getValues();
    onChange({
      clientName: current.clientName ?? "",
      clientEmail: current.clientEmail ?? "",
      clientPhone: current.clientPhone ?? "",
      shootType: current.shootType ?? "",
      idDocumentFile: value.idDocumentFile,
      ...patch,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <FieldLabel required>Full Name</FieldLabel>
        <input
          {...register("clientName", {
            onChange: (e) => pushToParent({ clientName: e.target.value }),
          })}
          placeholder="John Doe"
          style={fieldStyle}
        />
        {errors.clientName && (
          <p style={errorStyle}>{errors.clientName.message}</p>
        )}
      </div>

      <div className="booking-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <FieldLabel required>Email</FieldLabel>
          <input
            {...register("clientEmail", {
              onChange: (e) => pushToParent({ clientEmail: e.target.value }),
            })}
            type="email"
            placeholder="you@example.com"
            style={fieldStyle}
          />
          {errors.clientEmail && (
            <p style={errorStyle}>{errors.clientEmail.message}</p>
          )}
        </div>
        <div>
          <FieldLabel required>Phone</FieldLabel>
          <input
            {...register("clientPhone", {
              onChange: (e) => pushToParent({ clientPhone: e.target.value }),
            })}
            type="tel"
            placeholder="082 000 0000"
            style={fieldStyle}
          />
          {errors.clientPhone && (
            <p style={errorStyle}>{errors.clientPhone.message}</p>
          )}
        </div>
      </div>

      <div>
        <FieldLabel required>Type of Shoot / Project Description</FieldLabel>
        <textarea
          {...register("shootType", {
            onChange: (e) => pushToParent({ shootType: e.target.value }),
          })}
          placeholder="e.g. YouTube interview series, corporate video, product photography..."
          rows={3}
          style={{ ...fieldStyle, resize: "vertical" }}
        />
        {errors.shootType && (
          <p style={errorStyle}>{errors.shootType.message}</p>
        )}
      </div>

      <div>
        <FieldLabel required>Passport or ID Document</FieldLabel>
        <p style={{ fontSize: 12, color: "#8a857a", marginBottom: 8, lineHeight: 1.5 }}>
          Required for identity verification. Securely stored, used only for booking confirmation. Max 2MB.
        </p>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file && file.size > MAX_FILE_BYTES) {
              setFileError("File is too large. Please upload an image or PDF under 2MB.");
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
