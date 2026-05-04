"use client";

import { useState, useCallback } from "react";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import PackageSelector from "./PackageSelector";
import AddOnSelector from "./AddOnSelector";
import ClientDetailsForm from "./ClientDetailsForm";
import BankingDetailsForm from "./BankingDetailsForm";
import PaymentSummary from "./PaymentSummary";
import type { BookingFormState, TimeSlot, ClientDetails, BankingDetails } from "@/types/booking";
import type { Database } from "@/types/database";

type PricingRow = Database["public"]["Tables"]["pricing"]["Row"];
type AddOnItem = Database["public"]["Tables"]["add_ons"]["Row"];

interface BookingFormProps {
  pricing: PricingRow[];
  addOns: AddOnItem[];
}

const DEPOSIT = 750;
const STEPS = ["Date & Time", "Package", "Your Details", "Payment"];

function isWeekdayDate(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=Sun, 1=Mon...4=Thu, 5=Fri, 6=Sat
  return day >= 1 && day <= 4; // Mon–Thu = weekday
}

const EMPTY_STATE: BookingFormState = {
  date: "",
  timeSlot: null,
  packageType: null,
  durationType: null,
  isWeekday: true,
  selectedAddOnIds: [],
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  shootType: "",
  idDocumentFile: null,
  bankHolderName: "",
  bankName: "",
  accountNumber: "",
  branchCode: "",
  termsAccepted: false,
};

export default function BookingForm({ pricing, addOns }: BookingFormProps) {
  const [step, setStep] = useState(1);
  function goToStep(n: number) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(n);
  }
  const [form, setForm] = useState<BookingFormState>(EMPTY_STATE);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsBlocked, setSlotsBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleDateChange(date: string) {
    setForm((f) => ({
      ...f,
      date,
      timeSlot: null,
      isWeekday: isWeekdayDate(date),
    }));
    setLoadingSlots(true);
    setSlotsBlocked(false);
    try {
      const res = await fetch(`/api/availability?date=${date}`);
      const json = await res.json();
      setSlotsBlocked(json.blocked === true);
      setSlots(json.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  const handleClientChange = useCallback(
    (v: ClientDetails) => {
      setForm((f) => ({
        ...f,
        clientName: v.clientName,
        clientEmail: v.clientEmail,
        clientPhone: v.clientPhone,
        shootType: v.shootType,
        idDocumentFile: v.idDocumentFile,
      }));
    },
    []
  );

  const handleBankingChange = useCallback(
    (v: BankingDetails) => {
      setForm((f) => ({
        ...f,
        bankHolderName: v.bankHolderName,
        bankName: v.bankName,
        accountNumber: v.accountNumber,
        branchCode: v.branchCode,
      }));
    },
    []
  );

  function getPackagePrice(): number {
    if (!form.packageType || !form.durationType) return 0;
    const row = pricing.find(
      (p) =>
        p.package_type === form.packageType &&
        p.duration_type === form.durationType &&
        p.is_weekday === form.isWeekday
    );
    return row?.price_rands ?? 0;
  }

  function getAddOnsTotal(): number {
    return addOns
      .filter((a) => form.selectedAddOnIds.includes(a.id))
      .reduce((sum, a) => sum + a.price_rands, 0);
  }

  function canAdvanceStep1(): boolean {
    return !!form.date && !!form.timeSlot;
  }

  function canAdvanceStep2(): boolean {
    return !!form.packageType && !!form.durationType;
  }

  function canAdvanceStep3(): boolean {
    return (
      form.clientName.trim().length >= 2 &&
      form.clientEmail.includes("@") &&
      form.clientPhone.trim().length >= 7 &&
      form.shootType.trim().length >= 2 &&
      !!form.idDocumentFile &&
      form.bankHolderName.trim().length >= 2 &&
      form.bankName.trim().length >= 2 &&
      /^\d{8,16}$/.test(form.accountNumber) &&
      form.branchCode.trim().length >= 2
    );
  }

  async function handleSubmit() {
    if (!form.termsAccepted || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let idDocumentBase64: string | null = null;
      let idDocumentName: string | null = null;
      if (form.idDocumentFile) {
        idDocumentName = form.idDocumentFile.name;
        idDocumentBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Strip data URL prefix (e.g. "data:image/jpeg;base64,")
            const base64 = result.split(",")[1] ?? result;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(form.idDocumentFile!);
        });
      }

      const payload = {
        date: form.date,
        startTime: form.timeSlot!.start,
        endTime: form.timeSlot!.end,
        packageType: form.packageType,
        durationType: form.durationType,
        isWeekday: form.isWeekday,
        addOnIds: form.selectedAddOnIds,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        shootType: form.shootType,
        idDocumentBase64,
        idDocumentName,
        bankHolderName: form.bankHolderName,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        branchCode: form.branchCode,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Booking failed");
      }

      const { payfastUrl, payfastPayload } = await res.json();

      // Submit form to PayFast — causes full browser redirect
      const pfForm = document.createElement("form");
      pfForm.method = "POST";
      pfForm.action = payfastUrl;
      for (const [key, val] of Object.entries(payfastPayload as Record<string, string>)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = val;
        pfForm.appendChild(input);
      }
      document.body.appendChild(pfForm);
      pfForm.submit();
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const packagePrice = getPackagePrice();
  const addOnsTotal = getAddOnsTotal();

  return (
    <div>
      {/* Progress bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 40,
          borderRadius: 100,
          overflow: "hidden",
          border: "1px solid #e8e2d6",
          background: "#fff",
        }}
      >
        {STEPS.map((label, i) => {
          const n = i + 1;
          const isCurrent = step === n;
          const isDone = step > n;
          return (
            <div
              key={label}
              style={{
                flex: 1,
                padding: "12px 8px",
                textAlign: "center",
                background: isCurrent ? "#0e0d0b" : isDone ? "#f5f0e8" : "transparent",
                color: isCurrent ? "#faf7f2" : isDone ? "#a87d36" : "#8a857a",
                fontSize: 12,
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                letterSpacing: "0.06em",
                transition: "all 0.25s",
                borderRight: i < STEPS.length - 1 ? "1px solid #e8e2d6" : "none",
              }}
            >
              <span style={{ fontWeight: isCurrent || isDone ? 600 : 400 }}>
                {isDone ? "✓ " : `${n}. `}
              </span>
              {label}
            </div>
          );
        })}
      </div>

      {/* Step 1: Date & Time */}
      {step === 1 && (
        <div>
          <h2
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 24,
              fontWeight: 400,
              marginBottom: 24,
              color: "#0e0d0b",
            }}
          >
            Pick your date
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 32,
            }}
            className="booking-step1-grid"
          >
            <DatePicker value={form.date} onChange={handleDateChange} />
            <div>
              {form.date && (
                <>
                  <p
                    style={{
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#a87d36",
                      marginBottom: 12,
                    }}
                  >
                    Available times — {form.date}
                    {" "}({form.isWeekday ? "Weekday" : "Weekend"} rate)
                  </p>
                  {loadingSlots && (
                    <p style={{ fontSize: 14, color: "#8a857a" }}>Loading…</p>
                  )}
                  {slotsBlocked && (
                    <p style={{ fontSize: 14, color: "#c75a3c" }}>
                      This date is fully blocked. Please choose another.
                    </p>
                  )}
                  {!loadingSlots && !slotsBlocked && (
                    <TimePicker
                      slots={slots}
                      durationType={form.durationType}
                      value={form.timeSlot}
                      onChange={(slot) => setForm((f) => ({ ...f, timeSlot: slot }))}
                    />
                  )}
                </>
              )}
              {!form.date && (
                <p style={{ fontSize: 14, color: "#8a857a", fontStyle: "italic" }}>
                  Select a date to see available times.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => goToStep(2)}
            disabled={!canAdvanceStep1()}
            style={nextBtnStyle(!canAdvanceStep1())}
          >
            Next: Choose Package →
          </button>
        </div>
      )}

      {/* Step 2: Package */}
      {step === 2 && (
        <div>
          <h2 style={stepHeadingStyle}>Select your package</h2>
          <PackageSelector
            pricing={pricing}
            packageType={form.packageType}
            durationType={form.durationType}
            isWeekday={form.isWeekday}
            onPackageChange={(pkg) => setForm((f) => ({ ...f, packageType: pkg }))}
            onDurationChange={(dur) => setForm((f) => ({ ...f, durationType: dur }))}
          />
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button onClick={() => goToStep(1)} style={backBtnStyle}>
              ← Back
            </button>
            <button
              onClick={() => goToStep(3)}
              disabled={!canAdvanceStep2()}
              style={nextBtnStyle(!canAdvanceStep2())}
            >
              Next: Your Details →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div>
          <h2 style={stepHeadingStyle}>Your details</h2>

          {/* Add-ons — only shown for studio_only */}
          {form.packageType === "studio_only" && addOns.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle>Equipment Rental (optional)</SectionTitle>
              <AddOnSelector
                addOns={addOns}
                selectedIds={form.selectedAddOnIds}
                onChange={(ids) =>
                  setForm((f) => ({ ...f, selectedAddOnIds: ids }))
                }
              />
            </div>
          )}

          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Contact Information</SectionTitle>
            <ClientDetailsForm
              value={{
                clientName: form.clientName,
                clientEmail: form.clientEmail,
                clientPhone: form.clientPhone,
                shootType: form.shootType,
                idDocumentFile: form.idDocumentFile,
              }}
              onChange={handleClientChange}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Banking Details (for deposit refund)</SectionTitle>
            <BankingDetailsForm
              value={{
                bankHolderName: form.bankHolderName,
                bankName: form.bankName,
                accountNumber: form.accountNumber,
                branchCode: form.branchCode,
              }}
              onChange={handleBankingChange}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => goToStep(2)} style={backBtnStyle}>
              ← Back
            </button>
            <button
              onClick={() => goToStep(4)}
              disabled={!canAdvanceStep3()}
              style={nextBtnStyle(!canAdvanceStep3())}
            >
              Next: Review & Pay →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Payment */}
      {step === 4 && (
        <div>
          <h2 style={stepHeadingStyle}>Review &amp; pay</h2>

          {/* Booking summary */}
          <div
            style={{
              padding: 20,
              background: "#fff",
              border: "1px solid #e8e2d6",
              borderRadius: 8,
              marginBottom: 28,
              fontSize: 14,
              lineHeight: 1.8,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              <span style={{ color: "#8a857a" }}>Date</span>
              <span style={{ fontWeight: 500 }}>{form.date}</span>
              <span style={{ color: "#8a857a" }}>Time</span>
              <span style={{ fontWeight: 500 }}>
                {form.timeSlot?.start} – {form.timeSlot?.end}
              </span>
              <span style={{ color: "#8a857a" }}>Package</span>
              <span style={{ fontWeight: 500 }}>
                {form.packageType === "studio_only" ? "Studio Only" : "All-Inclusive"}
              </span>
              <span style={{ color: "#8a857a" }}>Duration</span>
              <span style={{ fontWeight: 500 }}>
                {form.durationType === "hourly"
                  ? "Hourly"
                  : form.durationType === "half_day"
                  ? "Half Day"
                  : "Full Day"}
              </span>
              <span style={{ color: "#8a857a" }}>Name</span>
              <span style={{ fontWeight: 500 }}>{form.clientName}</span>
              <span style={{ color: "#8a857a" }}>Email</span>
              <span style={{ fontWeight: 500 }}>{form.clientEmail}</span>
            </div>
          </div>

          {submitError && (
            <div
              style={{
                padding: "12px 16px",
                background: "#fde8e2",
                border: "1px solid #c75a3c",
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 14,
                color: "#c75a3c",
              }}
            >
              {submitError}
            </div>
          )}

          <PaymentSummary
            packagePrice={packagePrice}
            addOnsTotal={addOnsTotal}
            termsAccepted={form.termsAccepted}
            onTermsChange={(v) =>
              setForm((f) => ({ ...f, termsAccepted: v }))
            }
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          <button onClick={() => goToStep(3)} style={{ ...backBtnStyle, marginTop: 16 }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3
      style={{
        fontFamily: "var(--font-ibm-plex-mono), monospace",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#a87d36",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        style={{ flex: 1, height: 1, background: "#e8e2d6", display: "block" }}
        aria-hidden
      />
      {children}
      <span
        style={{ flex: 1, height: 1, background: "#e8e2d6", display: "block" }}
        aria-hidden
      />
    </h3>
  );
}

const stepHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), serif",
  fontSize: 24,
  fontWeight: 400,
  marginBottom: 24,
  color: "#0e0d0b",
};

function nextBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "14px 28px",
    background: disabled ? "#e8e2d6" : "#0e0d0b",
    color: disabled ? "#8a857a" : "#faf7f2",
    border: "none",
    borderRadius: 100,
    fontSize: 14,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.02em",
    fontFamily: "var(--font-inter), sans-serif",
  };
}

const backBtnStyle: React.CSSProperties = {
  padding: "14px 24px",
  background: "transparent",
  color: "#0e0d0b",
  border: "1px solid #e8e2d6",
  borderRadius: 100,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  letterSpacing: "0.02em",
  fontFamily: "var(--font-inter), sans-serif",
};
