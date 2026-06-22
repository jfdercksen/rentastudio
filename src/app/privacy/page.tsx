import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Kyalami Studio",
  description:
    "Privacy Policy for StudioBooking.co.za. How we collect, use, and protect your personal information in compliance with POPIA.",
};

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "who-we-are", label: "Who We Are" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "legal-basis", label: "Legal Basis for Processing" },
  { id: "sharing", label: "Sharing Your Information" },
  { id: "data-retention", label: "Data Retention" },
  { id: "security", label: "Data Security" },
  { id: "your-rights", label: "Your Rights (POPIA)" },
  { id: "cookies", label: "Cookies" },
  { id: "third-party", label: "Third-Party Links" },
  { id: "children", label: "Children's Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f0e8",
          paddingTop: 120,
          paddingBottom: 80,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>

          {/* Page header */}
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#a87d36",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 500,
              }}
            >
              <span style={{ width: 24, height: 1, background: "#c8984a", display: "block" }} />
              <Link href="/" style={{ color: "#a87d36", textDecoration: "none" }}>Home</Link>
              <span style={{ opacity: 0.5 }}>/</span>
              <span>Privacy Policy</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 300,
                letterSpacing: "-0.02em",
                color: "#0e0d0b",
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              Privacy{" "}
              <em style={{ fontStyle: "italic", color: "#c8984a" }}>Policy</em>
            </h1>

            <p
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 12,
                color: "#8a857a",
                letterSpacing: "0.06em",
              }}
            >
              Last updated: June 2026 &nbsp;·&nbsp; StudioBooking.co.za
            </p>

            <p
              style={{
                marginTop: 20,
                fontSize: 15,
                color: "#3a3a34",
                lineHeight: 1.7,
                maxWidth: 680,
              }}
            >
              Your privacy matters to us. This policy explains what personal information we collect,
              why we collect it, and how we protect it — in plain English, in compliance with the
              Protection of Personal Information Act (POPIA).
            </p>
          </div>

          {/* Layout: TOC sidebar + content */}
          <div
            className="privacy-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              gap: 60,
              alignItems: "start",
            }}
          >

            {/* TOC sidebar */}
            <aside
              className="privacy-toc"
              style={{
                position: "sticky",
                top: 100,
                background: "#0e0d0b",
                borderRadius: 10,
                padding: "28px 24px",
                color: "#faf7f2",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#c8984a",
                  marginBottom: 20,
                  fontWeight: 500,
                }}
              >
                Contents
              </div>
              <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {SECTIONS.map((s, i) => (
                  <li key={s.id} style={{ marginBottom: 10 }}>
                    <a
                      href={`#${s.id}`}
                      style={{
                        display: "flex",
                        gap: 10,
                        color: "rgba(250,247,242,0.75)",
                        textDecoration: "none",
                        fontSize: 12,
                        lineHeight: 1.4,
                        transition: "color 0.2s",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-ibm-plex-mono), monospace",
                          color: "#c8984a",
                          fontSize: 10,
                          minWidth: 18,
                          paddingTop: 1,
                          flexShrink: 0,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>

            {/* Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

              {/* 1. Introduction */}
              <section id="introduction">
                <SectionHeading number="01" title="Introduction" />
                <p style={bodyStyle}>
                  StudioBooking.co.za (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting the privacy and
                  personal information of all users of our platform. This Privacy Policy describes how
                  we collect, use, store, and share your personal information when you use our website
                  or make a booking through our platform.
                </p>
                <p style={bodyStyle}>
                  By using StudioBooking.co.za, you acknowledge that you have read and understood this
                  Privacy Policy. If you do not agree with the terms of this policy, please do not use
                  our platform.
                </p>
              </section>

              {/* 2. Who We Are */}
              <section id="who-we-are">
                <SectionHeading number="02" title="Who We Are" />
                <p style={bodyStyle}>
                  StudioBooking.co.za is a content studio booking platform operating from Kyalami Estates,
                  Johannesburg, South Africa. For the purposes of POPIA, we are the responsible party
                  in respect of the personal information we process.
                </p>
                <p style={bodyStyle}>
                  Contact details for our information officer are provided in the{" "}
                  <a href="#contact" style={linkStyle}>Contact Us</a> section of this policy.
                </p>
              </section>

              {/* 3. Information We Collect */}
              <section id="information-we-collect">
                <SectionHeading number="03" title="Information We Collect" />
                <p style={bodyStyle}>
                  We collect personal information that you provide directly to us when making a booking
                  or contacting us. This may include:
                </p>
                <ul style={listStyle}>
                  <li><strong>Identity information:</strong> Full name and a copy of your South African ID or passport, required for booking verification.</li>
                  <li><strong>Contact information:</strong> Email address and mobile phone number.</li>
                  <li><strong>Booking information:</strong> Dates, times, package selections, add-ons, and the nature of your shoot or project.</li>
                  <li><strong>Banking details:</strong> Account holder name, bank name, account number, and branch code — collected solely for the purpose of processing your refundable breakage deposit.</li>
                  <li><strong>Payment information:</strong> Payment transactions are processed by our third-party payment provider. We do not store your card or full banking details on our servers.</li>
                  <li><strong>Technical information:</strong> Device type, browser, IP address, and usage data collected automatically when you use our website (see <a href="#cookies" style={linkStyle}>Cookies</a>).</li>
                </ul>
              </section>

              {/* 4. How We Use Your Information */}
              <section id="how-we-use">
                <SectionHeading number="04" title="How We Use Your Information" />
                <p style={bodyStyle}>
                  We use your personal information only for the purposes for which it was collected:
                </p>
                <ul style={listStyle}>
                  <li>Processing, confirming, and managing your studio bookings.</li>
                  <li>Verifying your identity as required for booking security.</li>
                  <li>Sending booking confirmation, reminder, and update emails.</li>
                  <li>Processing and refunding your breakage deposit.</li>
                  <li>Responding to your enquiries and support requests.</li>
                  <li>Sending follow-up communications related to incomplete bookings (abandoned booking recovery).</li>
                  <li>Complying with our legal obligations under South African law.</li>
                  <li>Improving our platform and services using aggregated, anonymised data.</li>
                </ul>
                <p style={bodyStyle}>
                  We will not use your personal information for direct marketing purposes without your
                  explicit consent.
                </p>
              </section>

              {/* 5. Legal Basis */}
              <section id="legal-basis">
                <SectionHeading number="05" title="Legal Basis for Processing" />
                <p style={bodyStyle}>
                  Under POPIA, we process your personal information on the following grounds:
                </p>
                <ul style={listStyle}>
                  <li><strong>Contract:</strong> Processing is necessary to fulfil the booking agreement between you and us.</li>
                  <li><strong>Legal obligation:</strong> Processing required to comply with applicable South African laws and regulations.</li>
                  <li><strong>Legitimate interest:</strong> Processing that is necessary for our legitimate business interests, where those interests are not overridden by your rights and interests.</li>
                  <li><strong>Consent:</strong> Where you have given us explicit consent to process your information for a specific purpose.</li>
                </ul>
              </section>

              {/* 6. Sharing */}
              <section id="sharing">
                <SectionHeading number="06" title="Sharing Your Information" />
                <p style={bodyStyle}>
                  We do not sell, rent, or trade your personal information to third parties for marketing
                  or commercial purposes. We may share your information in the following limited circumstances:
                </p>
                <ul style={listStyle}>
                  <li><strong>Payment processors:</strong> Your payment information is shared with our authorised payment gateway (PayFast) to process booking payments securely.</li>
                  <li><strong>Email service providers:</strong> We use a third-party email delivery service (Resend) to send booking confirmations and communications. Only your email address and name are shared for this purpose.</li>
                  <li><strong>Legal requirements:</strong> We may disclose your information if required to do so by law, court order, or other governmental authority.</li>
                  <li><strong>Business transfers:</strong> If our business is sold or merged with another entity, your personal information may be transferred to the new owner, subject to the same privacy protections.</li>
                </ul>
                <p style={bodyStyle}>
                  All third parties with whom we share your information are required to process it
                  only as instructed by us and in accordance with applicable privacy laws.
                </p>
              </section>

              {/* 7. Data Retention */}
              <section id="data-retention">
                <SectionHeading number="07" title="Data Retention" />
                <p style={bodyStyle}>
                  We retain your personal information for as long as is necessary to fulfil the purposes
                  for which it was collected, or as required by law. Specifically:
                </p>
                <ul style={listStyle}>
                  <li>Booking records are retained for a minimum of 5 years for accounting and legal compliance purposes.</li>
                  <li>ID documents are retained for the duration of the booking relationship and deleted within 6 months of the last booking.</li>
                  <li>Banking details provided for deposit refunds are deleted once the deposit has been returned.</li>
                  <li>Communication records are retained for up to 3 years.</li>
                </ul>
                <p style={bodyStyle}>
                  When your information is no longer required, it is securely deleted or anonymised.
                </p>
              </section>

              {/* 8. Security */}
              <section id="security">
                <SectionHeading number="08" title="Data Security" />
                <p style={bodyStyle}>
                  We take the security of your personal information seriously and implement appropriate
                  technical and organisational measures to protect it against unauthorised access,
                  disclosure, alteration, or destruction. These measures include:
                </p>
                <ul style={listStyle}>
                  <li>Encrypted data transmission using HTTPS/TLS for all communications.</li>
                  <li>Secure cloud storage with access restricted to authorised personnel only.</li>
                  <li>ID documents stored in a private, access-controlled storage bucket.</li>
                  <li>Payment information handled exclusively by our PCI-compliant payment provider — we never store card details.</li>
                  <li>Row-level security policies enforced at the database level.</li>
                </ul>
                <p style={bodyStyle}>
                  While we take all reasonable precautions, no method of data transmission or storage is
                  100% secure. In the event of a data breach that affects your rights, we will notify
                  you and the Information Regulator as required by POPIA.
                </p>
              </section>

              {/* 9. Your Rights */}
              <section id="your-rights">
                <SectionHeading number="09" title="Your Rights Under POPIA" />
                <p style={bodyStyle}>
                  The Protection of Personal Information Act (POPIA) grants you the following rights
                  regarding your personal information:
                </p>
                <ul style={listStyle}>
                  <li><strong>Right of access:</strong> You may request a copy of the personal information we hold about you.</li>
                  <li><strong>Right to correction:</strong> You may request that inaccurate or incomplete information be corrected.</li>
                  <li><strong>Right to deletion:</strong> You may request that your personal information be deleted, subject to our legal retention obligations.</li>
                  <li><strong>Right to object:</strong> You may object to the processing of your personal information in certain circumstances.</li>
                  <li><strong>Right to withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.</li>
                  <li><strong>Right to lodge a complaint:</strong> You have the right to lodge a complaint with the Information Regulator of South Africa if you believe your rights have been violated.</li>
                </ul>
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 18px",
                    background: "#e8efea",
                    borderLeft: "3px solid #2f5f3f",
                    borderRadius: 4,
                    fontSize: 13,
                    color: "#2f5f3f",
                    lineHeight: 1.6,
                  }}
                >
                  To exercise any of these rights, contact us at{" "}
                  <a href="mailto:bookings@kyalamistudio.co.za" style={{ color: "#2f5f3f", fontWeight: 600 }}>
                    bookings@kyalamistudio.co.za
                  </a>
                  . We will respond within a reasonable time and no later than the period required by POPIA.
                </div>
              </section>

              {/* 10. Cookies */}
              <section id="cookies">
                <SectionHeading number="10" title="Cookies" />
                <p style={bodyStyle}>
                  Our website uses cookies and similar technologies to improve your browsing experience
                  and help us understand how our platform is used. Cookies are small text files stored
                  on your device.
                </p>
                <p style={bodyStyle}>
                  We use the following types of cookies:
                </p>
                <ul style={listStyle}>
                  <li><strong>Essential cookies:</strong> Required for the platform to function, including session management and security.</li>
                  <li><strong>Analytics cookies:</strong> Used to understand how visitors interact with our website so we can improve it. Data collected is aggregated and anonymised.</li>
                </ul>
                <p style={bodyStyle}>
                  You can control cookies through your browser settings. Disabling essential cookies may
                  affect the functionality of the platform.
                </p>
              </section>

              {/* 11. Third-Party Links */}
              <section id="third-party">
                <SectionHeading number="11" title="Third-Party Links" />
                <p style={bodyStyle}>
                  Our platform may contain links to third-party websites, including our payment provider
                  (PayFast). These sites have their own privacy policies, and we are not responsible for
                  their content or practices. We encourage you to review the privacy policies of any
                  third-party sites you visit.
                </p>
              </section>

              {/* 12. Children's Privacy */}
              <section id="children">
                <SectionHeading number="12" title="Children's Privacy" />
                <p style={bodyStyle}>
                  Our platform is not directed at children under the age of 18. We do not knowingly
                  collect personal information from anyone under 18 without verifiable parental or
                  guardian consent. If you believe we have inadvertently collected such information,
                  please contact us immediately and we will take steps to delete it.
                </p>
              </section>

              {/* 13. Changes */}
              <section id="changes">
                <SectionHeading number="13" title="Changes to This Policy" />
                <p style={bodyStyle}>
                  We may update this Privacy Policy from time to time to reflect changes in our
                  practices or legal requirements. When we make material changes, we will update
                  the &quot;Last updated&quot; date at the top of this page and, where appropriate,
                  notify you by email.
                </p>
                <p style={bodyStyle}>
                  We encourage you to review this policy periodically. Your continued use of the
                  platform after any changes constitutes your acceptance of the updated policy.
                </p>
              </section>

              {/* 14. Contact */}
              <section id="contact">
                <SectionHeading number="14" title="Contact Us" />
                <p style={bodyStyle}>
                  If you have any questions about this Privacy Policy, wish to exercise your rights
                  under POPIA, or want to raise a privacy concern, please contact our information
                  officer using the details below:
                </p>

                <div
                  style={{
                    background: "#0e0d0b",
                    borderRadius: 10,
                    padding: "28px 32px",
                    marginTop: 24,
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
                      background: "linear-gradient(90deg, #c8984a 0%, #2f5f3f 50%, #c75a3c 100%)",
                    }}
                  />
                  <div
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 22,
                      fontWeight: 300,
                      color: "#faf7f2",
                      marginBottom: 20,
                    }}
                  >
                    Rent{" "}
                    <em style={{ fontStyle: "italic", color: "#c8984a" }}>a</em>{" "}
                    Studio — Kyalami
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Email", value: "bookings@kyalamistudio.co.za", href: "mailto:bookings@kyalamistudio.co.za" },
                      { label: "Phone", value: "082 990 2219", href: "tel:0829902219" },
                      { label: "Location", value: "Kyalami Estates, Johannesburg, South Africa", href: null },
                    ].map(({ label, value, href }) => (
                      <div key={label} style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-ibm-plex-mono), monospace",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#c8984a",
                            minWidth: 70,
                            flexShrink: 0,
                          }}
                        >
                          {label}
                        </span>
                        {href ? (
                          <a href={href} style={{ color: "rgba(250,247,242,0.85)", fontSize: 14, textDecoration: "none" }}>
                            {value}
                          </a>
                        ) : (
                          <span style={{ color: "rgba(250,247,242,0.85)", fontSize: 14 }}>{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 20,
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 12,
                      color: "rgba(250,247,242,0.45)",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Information Regulator (South Africa):{" "}
                    <span style={{ color: "rgba(250,247,242,0.6)" }}>inforeg.org.za</span>
                  </div>
                </div>
              </section>

              {/* Footer nav within page */}
              <div
                style={{
                  paddingTop: 40,
                  borderTop: "1px solid #d4cbb8",
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#8a857a",
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    letterSpacing: "0.06em",
                  }}
                >
                  © {new Date().getFullYear()} StudioBooking.co.za · All rights reserved
                </p>
                <div style={{ display: "flex", gap: 20 }}>
                  <Link href="/terms" style={{ fontSize: 13, color: "#a87d36", textDecoration: "none" }}>
                    Terms &amp; Conditions
                  </Link>
                  <Link href="/booking" style={{ fontSize: 13, color: "#a87d36", textDecoration: "none" }}>
                    Book a Session
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <style>{`
        .privacy-toc a:hover { color: #c8984a !important; }
        @media (max-width: 768px) {
          .privacy-layout {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .privacy-toc {
            position: static !important;
          }
        }
      `}</style>

      <Footer />
    </>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <span
        style={{
          fontFamily: "var(--font-ibm-plex-mono), monospace",
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#c8984a",
          fontWeight: 500,
          display: "block",
          marginBottom: 8,
        }}
      >
        {number}
      </span>
      <h2
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 26,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          color: "#0e0d0b",
          lineHeight: 1.2,
          paddingBottom: 14,
          borderBottom: "1px solid #d4cbb8",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

const bodyStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#3a3a34",
  lineHeight: 1.8,
  marginBottom: 16,
};

const listStyle: React.CSSProperties = {
  paddingLeft: 24,
  marginBottom: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  fontSize: 15,
  color: "#3a3a34",
  lineHeight: 1.7,
};

const linkStyle: React.CSSProperties = {
  color: "#a87d36",
  textDecoration: "underline",
  textDecorationColor: "rgba(168,125,54,0.4)",
  textUnderlineOffset: 3,
};
