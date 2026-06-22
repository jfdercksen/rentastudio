"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BankingDetails } from "@/types/booking";

const BankingSchema = z.object({
  bankHolderName: z.string().min(2, "Enter account holder name"),
  bankName: z.string().min(2, "Select a bank"),
  accountNumber: z
    .string()
    .regex(/^\d+$/, "Digits only")
    .min(8, "Enter a valid account number"),
  branchCode: z.string().min(2, "Enter branch code or account type"),
});

type BankingFormValues = z.infer<typeof BankingSchema>;

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

export default function BankingDetailsForm({
  value,
  onChange,
}: BankingDetailsFormProps) {
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<BankingFormValues>({
    resolver: zodResolver(BankingSchema),
    defaultValues: {
      bankHolderName: value.bankHolderName,
      bankName: value.bankName,
      accountNumber: value.accountNumber,
      branchCode: value.branchCode,
    },
    mode: "onChange",
  });

  function pushToParent(patch: Partial<BankingFormValues>) {
    const current = getValues();
    onChange({
      bankHolderName: current.bankHolderName ?? "",
      bankName: current.bankName ?? "",
      accountNumber: current.accountNumber ?? "",
      branchCode: current.branchCode ?? "",
      ...patch,
    });
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
              {...register("bankHolderName", {
                onChange: (e) => pushToParent({ bankHolderName: e.target.value }),
              })}
              placeholder="As per ID"
              style={fieldStyle}
            />
            {errors.bankHolderName && (
              <p style={errorStyle}>{errors.bankHolderName.message}</p>
            )}
          </div>
          <div>
            <FieldLabel required>Bank</FieldLabel>
            <select
              {...register("bankName", {
                onChange: (e) => pushToParent({ bankName: e.target.value }),
              })}
              style={fieldStyle}
            >
              <option value="">Select bank...</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.bankName && (
              <p style={errorStyle}>{errors.bankName.message}</p>
            )}
          </div>
        </div>

        <div className="booking-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <FieldLabel required>Account Number</FieldLabel>
            <input
              {...register("accountNumber", {
                onChange: (e) => pushToParent({ accountNumber: e.target.value }),
              })}
              placeholder="Digits only"
              inputMode="numeric"
              style={fieldStyle}
            />
            {errors.accountNumber && (
              <p style={errorStyle}>{errors.accountNumber.message}</p>
            )}
          </div>
          <div>
            <FieldLabel required>Branch Code / Account Type</FieldLabel>
            <input
              {...register("branchCode", {
                onChange: (e) => pushToParent({ branchCode: e.target.value }),
              })}
              placeholder="e.g. Cheque / 250655"
              style={fieldStyle}
            />
            {errors.branchCode && (
              <p style={errorStyle}>{errors.branchCode.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
