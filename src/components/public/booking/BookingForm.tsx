"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
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
const STEPS = ["Date & Time", "Package", "Your Details", "Verify Email", "Payment"];
const DRAFT_KEY = "ks_booking_draft";
const DRAFT_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

interface BookingDraft {
  form: Omit<BookingFormState, "idDocumentFile">;
  idDocBase64: string | null;
  idDocName: string | null;
  promoCode: string;
  promoApplied: boolean;
  discountPercentage: number;
  savedAt: number;
}

function isWeekdayDate(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  return day >= 1 && day <= 4;
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
  useEffect(() => { window.scrollTo(0, 0); }, [step]);
  function goToStep(n: number) { setStep(n); }

  // Capture abandonment when user reaches email verification or payment step
  // without completing the booking. Fire-and-forget — never blocks the form.
  useEffect(() => {
    if ((step === 4 || step === 5) && form.clientEmail.includes("@") && form.clientName.trim()) {
      const stepLabel = step === 5 ? "payment" : "verification";
      fetch("/api/booking-abandonment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          clientPhone: form.clientPhone || undefined,
          bookingDetails: {
            date: form.date || undefined,
            startTime: form.timeSlot?.start,
            packageType: form.packageType ?? undefined,
            durationType: form.durationType ?? undefined,
          },
          stepReached: stepLabel,
        }),
      }).catch(() => { /* abandonment capture is best-effort */ });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const [form, setForm] = useState<BookingFormState>(EMPTY_STATE);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsBlocked, setSlotsBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoValidating, setPromoValidating] = useState(false);

  // Email verification state
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [restoredIdBase64, setRestoredIdBase64] = useState<string | null>(null);
  const [restoredIdName, setRestoredIdName] = useState<string | null>(null);
  // OTP code entry (stays on page — no redirect)
  const [otpCode, setOtpCode] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // When duration changes, recalculate the selected slot's end time or clear it if it no
  // longer fits (e.g. user picked 07:00 before selecting "Full Day", but 09:00–13:00 is taken).
  const slotsRef = useRef(slots);
  useEffect(() => { slotsRef.current = slots; }, [slots]);
  useEffect(() => {
    setForm((f) => {
      if (!f.timeSlot || !f.durationType) return f;
      const HOURS: Record<string, number> = { hourly: 1, half_day: 4, full_day: 13 };
      const dh = HOURS[f.durationType];
      const [sh, sm] = f.timeSlot.start.split(":").map(Number);
      const startMins = sh * 60 + sm;
      const endMins = startMins + dh * 60;
      if (endMins > 21 * 60) return { ...f, timeSlot: null };
      const currentSlots = slotsRef.current;
      const isValid = currentSlots
        .filter((s) => {
          const [hh, mm] = s.start.split(":").map(Number);
          const sm2 = hh * 60 + mm;
          return sm2 >= startMins && sm2 < endMins;
        })
        .every((s) => s.available);
      if (!isValid) return { ...f, timeSlot: null };
      const newEnd = `${String(Math.floor(endMins / 60)).padStart(2, "0")}:${String(endMins % 60).padStart(2, "0")}`;
      return { ...f, timeSlot: { ...f.timeSlot, end: newEnd } };
    });
  }, [form.durationType]); // eslint-disable-line react-hooks/exhaustive-deps

  // On mount: detect return from magic link and restore draft
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasVerified = url.searchParams.get("verified") === "true";
    const errorCode = url.searchParams.get("error_code");
    const hasError = !!url.searchParams.get("error");

    if (!hasVerified && !hasError) return;

    window.history.replaceState({}, "", "/booking");

    function applyDraft(draft: BookingDraft): boolean {
      // Reject incomplete drafts — prevents a broken step 5 with null timeSlot/package
      if (!draft.form?.timeSlot || !draft.form?.packageType || !draft.form?.durationType) {
        return false;
      }
      setForm({ ...draft.form, idDocumentFile: null });
      setPromoCode(draft.promoCode);
      setPromoApplied(draft.promoApplied);
      setDiscountPercentage(draft.discountPercentage);
      setRestoredIdBase64(draft.idDocBase64 ?? null);
      setRestoredIdName(draft.idDocName ?? null);
      return true;
    }

    // Fast path: localStorage works when the link opens in any tab of the same browser
    function tryLocalRestore(): boolean {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      try {
        const draft = JSON.parse(raw) as BookingDraft;
        localStorage.removeItem(DRAFT_KEY);
        if (Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) return false;
        return applyDraft(draft);
      } catch {
        localStorage.removeItem(DRAFT_KEY);
        return false;
      }
    }

    if (hasError) {
      tryLocalRestore();
      const msg =
        errorCode === "otp_expired"
          ? "Your verification link expired. Click 'try again' to get a new one."
          : "Verification failed. Please try again.";
      setVerifyError(msg);
      setStep(4);
      return;
    }

    if (tryLocalRestore()) {
      setStep(5);
      return;
    }

    // Slow path: different browser or device — wait for Supabase auth then fetch from server
    setVerifyLoading(true);
    const supabase = createClient();
    let done = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function tryServerRestore(email: string) {
      if (done) return;
      done = true;
      try {
        const { data } = await supabase
          .from("booking_drafts")
          .select("draft")
          .eq("email", email)
          .gt("expires_at", new Date().toISOString())
          .single();

        if (data?.draft) {
          const applied = applyDraft(data.draft as unknown as BookingDraft);
          // Clean up after reading — fire and forget
          supabase.from("booking_drafts").delete().eq("email", email).then(() => {});
          if (applied) {
            setVerifyLoading(false);
            setStep(5);
            return;
          }
        }
      } catch {
        // fall through to the not-found message
      }
      setVerifyLoading(false);
      setSubmitError(
        "Your email was verified but your booking details were not found. Please fill in your details again."
      );
      setStep(1);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (done) return;
      if (
        (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        session?.user?.email
      ) {
        clearTimeout(timeoutId);
        subscription.unsubscribe();
        tryServerRestore(session.user.email);
      }
    });

    timeoutId = setTimeout(() => {
      if (done) return;
      done = true;
      subscription.unsubscribe();
      setVerifyLoading(false);
      setSubmitError(
        "Your email was verified but your booking details were not found. Please fill in your details again."
      );
      setStep(1);
    }, 10000);

    return () => {
      done = true;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  async function handleDateChange(date: string) {
    setForm((f) => ({ ...f, date, timeSlot: null, isWeekday: isWeekdayDate(date) }));
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

  const handleClientChange = useCallback((v: ClientDetails) => {
    setForm((f) => ({
      ...f,
      clientName: v.clientName,
      clientEmail: v.clientEmail,
      clientPhone: v.clientPhone,
      shootType: v.shootType,
      idDocumentFile: v.idDocumentFile,
    }));
  }, []);

  const handleBankingChange = useCallback((v: BankingDetails) => {
    setForm((f) => ({
      ...f,
      bankHolderName: v.bankHolderName,
      bankName: v.bankName,
      accountNumber: v.accountNumber,
      branchCode: v.branchCode,
    }));
  }, []);

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
    const hasIdDoc = !!form.idDocumentFile || !!restoredIdBase64;
    return (
      !!form.timeSlot &&
      !!form.packageType &&
      !!form.durationType &&
      form.clientName.trim().length >= 2 &&
      form.clientEmail.includes("@") &&
      form.clientPhone.trim().length >= 7 &&
      form.shootType.trim().length >= 2 &&
      hasIdDoc &&
      form.bankHolderName.trim().length >= 2 &&
      form.bankName.trim().length >= 2 &&
      /^\d{8,16}$/.test(form.accountNumber) &&
      form.branchCode.trim().length >= 2
    );
  }

  async function handleSendVerification() {
    if (verifyLoading) return;
    setVerifyLoading(true);
    setVerifyError(null);

    // Convert ID document file to base64 so it survives the magic link redirect
    let idDocBase64: string | null = restoredIdBase64;
    let idDocName: string | null = restoredIdName;
    if (form.idDocumentFile) {
      idDocName = form.idDocumentFile.name;
      idDocBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1] ?? result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(form.idDocumentFile!);
      });
    }

    // Persist form state in sessionStorage before redirect
    const draft: BookingDraft = {
      form: (({ idDocumentFile: _f, ...rest }) => rest)(form),
      idDocBase64,
      idDocName,
      promoCode,
      promoApplied,
      discountPercentage,
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

    // Also save to server (without the ID doc) so the draft survives a different browser/device
    const serverDraft: BookingDraft = { ...draft, idDocBase64: null, idDocName: null };
    fetch("/api/booking-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.clientEmail, draft: serverDraft }),
    }).catch((e: unknown) => console.error("Server draft save failed:", e));

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: form.clientEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/booking?verified=true`,
      },
    });

    setVerifyLoading(false);

    if (error) {
      setVerifyError(error.message);
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    setVerificationSent(true);
  }

  async function handleVerifyOtp() {
    if (otpVerifying || otpCode.length !== 6) return;
    setOtpVerifying(true);
    setOtpError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: form.clientEmail,
      token: otpCode,
      type: "email",
    });

    setOtpVerifying(false);

    if (error) {
      setOtpError(
        error.message.toLowerCase().includes("expired") || error.message.toLowerCase().includes("invalid")
          ? "That code is incorrect or has expired. Check your email or click 'Resend' for a new one."
          : error.message
      );
      return;
    }

    // Verified in-place — no redirect needed, form state is intact
    setStep(5);
  }

  async function handleSubmit() {
    if (!form.termsAccepted || isSubmitting) return;

    if (!form.timeSlot) {
      setSubmitError("Your session is missing the time slot. Please go back to step 1 and select your date and time again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Use restored base64 if the File object was lost across the magic link redirect
      let idDocumentBase64: string | null = null;
      let idDocumentName: string | null = null;
      if (form.idDocumentFile) {
        idDocumentName = form.idDocumentFile.name;
        idDocumentBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1] ?? result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(form.idDocumentFile!);
        });
      } else if (restoredIdBase64) {
        idDocumentBase64 = restoredIdBase64;
        idDocumentName = restoredIdName;
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
        promoCode: promoApplied ? promoCode : null,
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

      const json = await res.json();

      if (json.free) {
        window.location.href = `/booking/confirmed?m_payment_id=${json.paymentId}`;
        return;
      }

      const pfForm = document.createElement("form");
      pfForm.method = "POST";
      pfForm.action = json.payfastUrl;
      for (const [key, val] of Object.entries(json.payfastPayload as Record<string, string>)) {
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

  async function handleApplyPromo() {
    if (promoValidating) return;
    if (promoApplied) {
      setPromoApplied(false);
      setDiscountPercentage(0);
      setPromoError(null);
      return;
    }
    if (!promoCode.trim()) return;
    setPromoValidating(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountPercentage(data.discountPercentage as number);
        setPromoApplied(true);
      } else {
        setPromoError(data.message ?? "Invalid or inactive voucher code");
        setPromoApplied(false);
        setDiscountPercentage(0);
      }
    } catch {
      setPromoError("Could not validate voucher. Please try again.");
    } finally {
      setPromoValidating(false);
    }
  }

  const packagePrice = getPackagePrice();
  const addOnsTotal = getAddOnsTotal();
  const subtotalWithDeposit = packagePrice + addOnsTotal + DEPOSIT;
  const discountAmount = promoApplied
    ? parseFloat((subtotalWithDeposit * discountPercentage / 100).toFixed(2))
    : 0;

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

          {submitError && (
            <div
              style={{
                padding: "12px 16px",
                background: "#fef3e2",
                border: "1px solid #c8984a",
                borderRadius: 6,
                marginBottom: 20,
                fontSize: 14,
                color: "#7a5a1e",
              }}
            >
              {submitError}
            </div>
          )}
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

          {form.packageType === "studio_only" && addOns.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle>Equipment Rental (optional)</SectionTitle>
              <AddOnSelector
                addOns={addOns}
                selectedIds={form.selectedAddOnIds}
                onChange={(ids) => setForm((f) => ({ ...f, selectedAddOnIds: ids }))}
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
              onClick={() => { goToStep(4); handleSendVerification(); }}
              disabled={!canAdvanceStep3()}
              style={nextBtnStyle(!canAdvanceStep3())}
            >
              Next: Verify Email →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Verify Email */}
      {step === 4 && (
        <div>
          <h2 style={stepHeadingStyle}>Verify your email</h2>

          {verifyLoading && (
            <div style={infoBoxStyle}>
              <p style={{ margin: 0, fontSize: 15, color: "#3a3a34" }}>
                Sending verification email…
              </p>
            </div>
          )}

          {verifyError && (
            <div
              style={{
                padding: "16px 20px",
                background: "#fde8e2",
                border: "1px solid #c75a3c",
                borderRadius: 8,
                marginBottom: 24,
                fontSize: 14,
                color: "#c75a3c",
              }}
            >
              {verifyError} —{" "}
              <button
                onClick={handleSendVerification}
                style={{ background: "none", border: "none", color: "#c75a3c", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: 14 }}
              >
                try again
              </button>
            </div>
          )}

          {verificationSent && !verifyError && (
            <div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "#f3e6cb",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  marginBottom: 24,
                }}
              >
                ✉
              </div>

              <div style={infoBoxStyle}>
                <p style={{ margin: "0 0 8px", fontSize: 15, color: "#3a3a34", fontWeight: 500 }}>
                  Check your inbox
                </p>
                <p style={{ margin: 0, fontSize: 14, color: "#8a857a", lineHeight: 1.6 }}>
                  We sent a verification code to{" "}
                  <strong style={{ color: "#0e0d0b" }}>{form.clientEmail}</strong>.
                  Enter the 6-digit code below to continue.
                </p>
              </div>

              {/* OTP code input */}
              <div style={{ marginTop: 24, marginBottom: 8 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpError(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: 28,
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    letterSpacing: "0.3em",
                    textAlign: "center",
                    border: "1px solid #e8e2d6",
                    borderRadius: 8,
                    outline: "none",
                    background: "#fff",
                    color: "#0e0d0b",
                    boxSizing: "border-box",
                  }}
                  autoComplete="one-time-code"
                />
                {otpError && (
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "#c75a3c" }}>
                    {otpError}
                  </p>
                )}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={otpCode.length !== 6 || otpVerifying}
                style={{ ...nextBtnStyle(otpCode.length !== 8 || otpVerifying), marginBottom: 16 }}
              >
                {otpVerifying ? "Verifying…" : "Verify & Continue →"}
              </button>

              <p style={{ fontSize: 12, color: "#8a857a", marginBottom: 20 }}>
                You can also click the link in the email to continue directly.
              </p>

              <p style={{ fontSize: 13, color: "#8a857a" }}>
                Didn&apos;t receive it?{" "}
                <button
                  onClick={() => { handleSendVerification(); setOtpCode(""); setOtpError(null); }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#a87d36",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    fontSize: 13,
                  }}
                >
                  Resend email
                </button>
              </p>
            </div>
          )}

          <button onClick={() => goToStep(3)} style={{ ...backBtnStyle, marginTop: 24 }}>
            ← Back
          </button>
        </div>
      )}

      {/* Step 5: Payment */}
      {step === 5 && (
        <div>
          <h2 style={stepHeadingStyle}>Review &amp; pay</h2>

          <div
            style={{
              padding: "12px 16px",
              background: "#e8efea",
              borderLeft: "3px solid #2f5f3f",
              borderRadius: 4,
              marginBottom: 24,
              fontSize: 13,
              color: "#2f5f3f",
            }}
          >
            ✓ Email verified — {form.clientEmail}
          </div>

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
            promoCode={promoCode}
            promoApplied={promoApplied}
            discountAmount={discountAmount}
            promoError={promoError}
            promoValidating={promoValidating}
            onPromoCodeChange={setPromoCode}
            onPromoApply={handleApplyPromo}
            termsAccepted={form.termsAccepted}
            onTermsChange={(v) => setForm((f) => ({ ...f, termsAccepted: v }))}
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
      <span style={{ flex: 1, height: 1, background: "#e8e2d6", display: "block" }} aria-hidden />
      {children}
      <span style={{ flex: 1, height: 1, background: "#e8e2d6", display: "block" }} aria-hidden />
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

const infoBoxStyle: React.CSSProperties = {
  padding: "20px 24px",
  background: "#f5f0e8",
  borderRadius: 8,
  marginBottom: 16,
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
