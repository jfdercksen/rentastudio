"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface ContentEditorProps {
  initialContent: Record<string, string>;
}

type SaveState = "idle" | "saving" | "saved" | "error";

function useSaveState(): [SaveState, () => Promise<void>] {
  const [state, setState] = useState<SaveState>("idle");

  async function run() {
    // Placeholder — actual save is provided by the caller via the returned setter
  }

  return [state, run];
}

async function saveContent(key: string, value: string): Promise<boolean> {
  const res = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  return res.ok;
}

function SaveButton({
  onClick,
  state,
}: {
  onClick: () => void;
  state: SaveState;
}) {
  const labels: Record<SaveState, string> = {
    idle: "Save",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  };

  return (
    <button
      onClick={onClick}
      disabled={state === "saving"}
      style={{
        padding: "8px 20px",
        background: state === "saved" ? "#d1fae5" : state === "error" ? "#fee2e2" : "#0e0d0b",
        color: state === "saved" ? "#065f46" : state === "error" ? "#7f1d1d" : "#faf7f2",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        cursor: state === "saving" ? "not-allowed" : "pointer",
      }}
    >
      {labels[state]}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e2d6",
        borderRadius: 10,
        padding: "28px",
        marginBottom: 24,
      }}
    >
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#0e0d0b",
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function ContentEditor({ initialContent }: ContentEditorProps) {
  // --- Amenities ---
  const [amenities, setAmenities] = useState<string>(
    (() => {
      try {
        const parsed = JSON.parse(initialContent.amenities ?? "[]") as string[];
        return parsed.join("\n");
      } catch {
        return initialContent.amenities ?? "";
      }
    })()
  );
  const [amenitiesState, setAmenitiesState] = useState<SaveState>("idle");

  async function saveAmenities() {
    setAmenitiesState("saving");
    const list = amenities.split("\n").filter(Boolean);
    const ok = await saveContent("amenities", JSON.stringify(list));
    setAmenitiesState(ok ? "saved" : "error");
    if (ok) setTimeout(() => setAmenitiesState("idle"), 2000);
  }

  // --- FAQ ---
  const [faqItems, setFaqItems] = useState<FAQItem[]>(
    (() => {
      try {
        return JSON.parse(initialContent.faq_items ?? "[]") as FAQItem[];
      } catch {
        return [];
      }
    })()
  );
  const [faqState, setFaqState] = useState<SaveState>("idle");

  function updateFaq(idx: number, field: keyof FAQItem, value: string) {
    setFaqItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  function addFaqRow() {
    setFaqItems((prev) => [...prev, { question: "", answer: "" }]);
  }

  function removeFaqRow(idx: number) {
    setFaqItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveFaq() {
    const valid = faqItems.filter((f) => f.question.trim() && f.answer.trim());
    setFaqState("saving");
    const ok = await saveContent("faq_items", JSON.stringify(valid));
    setFaqState(ok ? "saved" : "error");
    if (ok) {
      setFaqItems(valid);
      setTimeout(() => setFaqState("idle"), 2000);
    }
  }

  // --- Terms & Conditions ---
  const [terms, setTerms] = useState<string>(initialContent.terms_conditions ?? "");
  const [termsState, setTermsState] = useState<SaveState>("idle");

  async function saveTerms() {
    setTermsState("saving");
    const ok = await saveContent("terms_conditions", terms);
    setTermsState(ok ? "saved" : "error");
    if (ok) setTimeout(() => setTermsState("idle"), 2000);
  }

  // --- Footer ---
  const [footerAddress, setFooterAddress] = useState<string>(
    initialContent.footer_address ?? ""
  );
  const [footerPhone, setFooterPhone] = useState<string>(
    initialContent.footer_phone ?? ""
  );
  const [footerState, setFooterState] = useState<SaveState>("idle");

  async function saveFooter() {
    setFooterState("saving");
    const [ok1, ok2] = await Promise.all([
      saveContent("footer_address", footerAddress),
      saveContent("footer_phone", footerPhone),
    ]);
    const ok = ok1 && ok2;
    setFooterState(ok ? "saved" : "error");
    if (ok) setTimeout(() => setFooterState("idle"), 2000);
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e8e2d6",
    borderRadius: 6,
    fontSize: 14,
    color: "#0e0d0b",
    outline: "none",
    boxSizing: "border-box" as const,
    background: "#faf7f2",
  };

  return (
    <div>
      {/* Amenities */}
      <Section title="Amenities">
        <p style={{ fontSize: 13, color: "#8a857a", marginBottom: 12 }}>
          One amenity per line.
        </p>
        <textarea
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
          rows={8}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", lineHeight: 1.8 }}
        />
        <div style={{ marginTop: 12 }}>
          <SaveButton onClick={saveAmenities} state={amenitiesState} />
        </div>
      </Section>

      {/* FAQ */}
      <Section title="FAQ">
        {faqItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: "16px",
              border: "1px solid #e8e2d6",
              borderRadius: 6,
              marginBottom: 12,
              background: "#faf7f2",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Question"
                  value={item.question}
                  onChange={(e) => updateFaq(idx, "question", e.target.value)}
                  style={{ ...inputStyle, marginBottom: 8, fontWeight: 500 }}
                />
                <textarea
                  placeholder="Answer"
                  value={item.answer}
                  onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <button
                onClick={() => removeFaqRow(idx)}
                style={{
                  padding: "4px 10px",
                  background: "#fee2e2",
                  color: "#7f1d1d",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: "pointer",
                  flexShrink: 0,
                  marginTop: 4,
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <button
            onClick={addFaqRow}
            style={{
              padding: "8px 16px",
              background: "#f5f0e8",
              color: "#3a3a34",
              border: "1px solid #e8e2d6",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Add Question
          </button>
          <SaveButton onClick={saveFaq} state={faqState} />
        </div>
      </Section>

      {/* Terms & Conditions */}
      <Section title="Terms & Conditions">
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={14}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        />
        <div style={{ marginTop: 12 }}>
          <SaveButton onClick={saveTerms} state={termsState} />
        </div>
      </Section>

      {/* Footer */}
      <Section title="Footer">
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#8a857a", marginBottom: 6 }}>
            Studio Address
          </label>
          <input
            type="text"
            value={footerAddress}
            onChange={(e) => setFooterAddress(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#8a857a", marginBottom: 6 }}>
            Phone Number
          </label>
          <input
            type="text"
            value={footerPhone}
            onChange={(e) => setFooterPhone(e.target.value)}
            style={inputStyle}
          />
        </div>
        <SaveButton onClick={saveFooter} state={footerState} />
      </Section>
    </div>
  );
}
