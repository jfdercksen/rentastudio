"use client";

import { useState } from "react";
import type { BankingDetails } from "@/types/booking";

interface BankingDetailsFormProps {
  value: BankingDetails;
  onChange: (v: BankingDetails) => void;
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
      {required && <span style={{ color: "#c75a3c", marginLeft: 2 }}>*</span>}
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

const BANKS = [
  "FNB",
  "Standard Bank",
  "Nedbank",
  "Absa",
  "Capitec",
  "TymeBank",
  "African Bank",
  "Discovery Bank",
  "Investec",
  "Other",
];

function validateField(field: string, val: string): string {
  if (field === "bankHolderName" && val.trim().length < 2) return "Enter account holder name";
  if (field === "bankName" && val.trim().length < 2) return "Select a bank";
  if (field === "accountNumber" && !/^\d{8,16}$/.test(val.trim())) return "Enter a valid account number (8–16 digits)";
  if (field === "branchCode" && val.trim().length < 2) return "Enter branch code or account type";
  return "";
}

export default function BankingDetailsForm({
  value,
  onChange,
}: BankingDetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function handle(field: keyof BankingDetails, val: string) {
    onChange({ ...value, [field]: val });
    if (touched[field]) {
      setErrors((e) => ({ ...e, [field]: validateField(field, val) }));
    }
  }

  function blur(field: keyof BankingDetails) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({
      ...e,
      [field]: validateField(field, String(value[field] ?? "")),
    }));
  }

  return (
    <div>
      <div
        style={{
          padding: "14px 16px",
          background: "#e8efea",
          borderLeft: "3px solid #2f5f3f",
          borderRadius: 4,
          marginBottom: 20,
          fontSize: 13,
          color: "#3a3a34",
          lineHeight: 1.5,
        }}
      >
        Banking details are required for your refundable{" "}
        <strong style={{ color: "#2f5f3f" }}>R750 breakage deposit</strong> refund, paid
        within 48–72 hours after your session.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="booking-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <FieldLabel required>Account Holder Name</FieldLabel>
            <input
              value={value.bankHolderName}
              onChange={(e) => handle("bankHolderName", e.target.value)}
              onBlur={() => blur("bankHolderName")}
              placeholder="As per ID"
              style={fieldStyle}
            />
            {touched.bankHolderName && errors.bankHolderName && (
              <p style={errorStyle}>{errors.bankHolderName}</p>
            )}
          </div>
          <div>
            <FieldLabel required>Bank</FieldLabel>
            <select
              value={value.bankName}
              onChange={(e) => handle("bankName", e.target.value)}
              onBlur={() => blur("bankName")}
              style={fieldStyle}
            >
              <option value="">Select bank...</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {touched.bankName && errors.bankName && (
              <p style={errorStyle}>{errors.bankName}</p>
            )}
          </div>
        </div>

        <div className="booking-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <FieldLabel required>Account Number</FieldLabel>
            <input
              value={value.accountNumber}
              onChange={(e) => handle("accountNumber", e.target.value)}
              onBlur={() => blur("accountNumber")}
              placeholder="Digits only"
              inputMode="numeric"
              style={fieldStyle}
            />
            {touched.accountNumber && errors.accountNumber && (
              <p style={errorStyle}>{errors.accountNumber}</p>
            )}
          </div>
          <div>
            <FieldLabel required>Branch Code / Account Type</FieldLabel>
            <input
              value={value.branchCode}
              onChange={(e) => handle("branchCode", e.target.value)}
              onBlur={() => blur("branchCode")}
              placeholder="e.g. Cheque / 250655"
              style={fieldStyle}
            />
            {touched.branchCode && errors.branchCode && (
              <p style={errorStyle}>{errors.branchCode}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
