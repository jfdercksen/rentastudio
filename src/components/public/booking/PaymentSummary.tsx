"use client";

const DEPOSIT = 750;

interface PaymentSummaryProps {
  packagePrice: number;
  addOnsTotal: number;
  termsAccepted: boolean;
  onTermsChange: (v: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function PaymentSummary({
  packagePrice,
  addOnsTotal,
  termsAccepted,
  onTermsChange,
  onSubmit,
  isSubmitting,
}: PaymentSummaryProps) {
  const total = packagePrice + addOnsTotal + DEPOSIT;

  return (
    <div>
      {/* Summary box */}
      <div
        style={{
          background: "#0e0d0b",
          color: "#faf7f2",
          borderRadius: 8,
          padding: 24,
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "#c8984a",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
            fontSize: 14,
          }}
        >
          <span>Studio package</span>
          <span>R{packagePrice.toFixed(2)}</span>
        </div>
        {addOnsTotal > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <span>Equipment add-ons</span>
            <span>R{addOnsTotal.toFixed(2)}</span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
            fontSize: 13,
            color: "#c8984a",
          }}
        >
          <span>Breakage deposit (refundable)</span>
          <span>+R{DEPOSIT.toFixed(2)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 0 6px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            marginTop: 10,
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 24,
            fontWeight: 500,
            color: "#c8984a",
          }}
        >
          <span>Total</span>
          <span>R{total.toFixed(2)}</span>
        </div>
      </div>

      {/* T&C checkbox */}
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: 18,
          background: "#f7ecd7",
          borderRadius: 6,
          marginBottom: 20,
          cursor: "pointer",
          border: "1px solid #d4cbb8",
          transition: "border-color 0.2s",
        }}
      >
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsChange(e.target.checked)}
          style={{ marginTop: 3, accentColor: "#a87d36", flexShrink: 0 }}
        />
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "#3a3a34" }}>
          <strong style={{ color: "#0e0d0b" }}>
            I agree to the Terms &amp; Conditions
          </strong>
          <br />
          By checking this box, you confirm you have read and accepted the
          studio&apos;s cancellation policy, equipment use rules, and breakage
          deposit terms.
        </div>
      </label>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!termsAccepted || isSubmitting}
        style={{
          width: "100%",
          padding: 20,
          background: "#c8984a",
          color: "#0e0d0b",
          border: "none",
          borderRadius: 100,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.02em",
          cursor: !termsAccepted || isSubmitting ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "all 0.25s",
          opacity: !termsAccepted || isSubmitting ? 0.4 : 1,
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {isSubmitting ? "Processing…" : "Pay securely with PayFast →"}
      </button>
      <p
        style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 11,
          color: "#8a857a",
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Secured · Encrypted · SA Payment Gateway
      </p>
    </div>
  );
}
