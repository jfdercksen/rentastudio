"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
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

export default function ClientDetailsForm({
  value,
  onChange,
}: ClientDetailsFormProps) {
  const {
    register,
    watch,
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

  const watched = watch();
  useEffect(() => {
    onChange({
      clientName: watched.clientName ?? "",
      clientEmail: watched.clientEmail ?? "",
      clientPhone: watched.clientPhone ?? "",
      shootType: watched.shootType ?? "",
      idDocumentFile: value.idDocumentFile,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched.clientName, watched.clientEmail, watched.clientPhone, watched.shootType]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <FieldLabel required>Full Name</FieldLabel>
        <input
          {...register("clientName")}
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
            {...register("clientEmail")}
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
            {...register("clientPhone")}
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
          {...register("shootType")}
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
          Required for identity verification. Securely stored, used only for booking confirmation. Max 10MB.
        </p>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onChange({ ...value, idDocumentFile: file });
          }}
          style={{ ...fieldStyle, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}
        />
      </div>
    </div>
  );
}
