import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions — Kyalami Studio",
  description:
    "Terms and Conditions for StudioBooking.co.za. Governing bookings, payments, cancellations, and user conduct.",
};

const SECTIONS = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "user-accounts", label: "User Accounts" },
  { id: "bookings", label: "Bookings & Reservations" },
  { id: "payments", label: "Payments" },
  { id: "cancellation", label: "Cancellation & Refunds" },
  { id: "health", label: "Health & Participation" },
  { id: "liability", label: "Waiver of Liability" },
  { id: "conduct", label: "User Conduct" },
  { id: "ip", label: "Intellectual Property" },
  { id: "privacy", label: "Privacy & POPIA" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "availability", label: "Service Availability" },
  { id: "amendments", label: "Amendments" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact", label: "Contact Information" },
];

export default function TermsPage() {
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
              <span>Terms &amp; Conditions</span>
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
              Terms &amp;{" "}
              <em style={{ fontStyle: "italic", color: "#c8984a" }}>Conditions</em>
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
              Please read these Terms and Conditions carefully before using StudioBooking.co.za.
              By accessing or booking through this platform, you agree to be bound by these terms.
            </p>
          </div>

          {/* Layout: TOC sidebar + content */}
          <div
            className="terms-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              gap: 60,
              alignItems: "start",
            }}
          >

            {/* TOC sidebar */}
            <aside
              className="terms-toc"
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

              {/* 1. Acceptance of Terms */}
              <section id="acceptance">
                <SectionHeading number="01" title="Acceptance of Terms" />
                <p style={bodyStyle}>
                  By accessing, browsing, or using StudioBooking.co.za (the &quot;Platform&quot;), you confirm that you
                  have read, understood, and agree to be bound by these Terms and Conditions and our{" "}
                  <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>. If you do not agree to these
                  terms, you must immediately discontinue your use of the Platform.
                </p>
                <p style={bodyStyle}>
                  These Terms and Conditions apply to all visitors, users, and others who access or use the Platform,
                  including those who make bookings for studio sessions.
                </p>
              </section>

              {/* 2. Eligibility */}
              <section id="eligibility">
                <SectionHeading number="02" title="Eligibility" />
                <p style={bodyStyle}>
                  You must be at least 18 years of age to make a booking through StudioBooking.co.za. If you are
                  under 18, a parent or legal guardian must make the booking on your behalf and accepts responsibility
                  for ensuring compliance with these Terms and Conditions.
                </p>
                <p style={bodyStyle}>
                  By making a booking, you represent and warrant that you are either at least 18 years old or that
                  you have obtained the express consent of a parent or legal guardian.
                </p>
              </section>

              {/* 3. User Accounts */}
              <section id="user-accounts">
                <SectionHeading number="03" title="User Accounts" />
                <p style={bodyStyle}>
                  When booking through the Platform, you agree to:
                </p>
                <ul style={listStyle}>
                  <li>Provide accurate, current, and complete information as prompted by the booking form.</li>
                  <li>Maintain the accuracy of your information and update it as necessary.</li>
                  <li>Keep your access credentials confidential and not share them with third parties.</li>
                  <li>Accept responsibility for all activity that occurs under your account or using your access link.</li>
                  <li>Notify StudioBooking.co.za immediately of any unauthorised use of your booking details.</li>
                </ul>
                <p style={bodyStyle}>
                  We reserve the right to suspend or terminate access where we have reason to believe that information
                  provided is inaccurate or that the account is being used in violation of these Terms.
                </p>
              </section>

              {/* 4. Bookings and Reservations */}
              <section id="bookings">
                <SectionHeading number="04" title="Bookings and Reservations" />
                <p style={bodyStyle}>
                  All bookings are subject to availability at the time of confirmation. Selecting a time slot does not
                  guarantee your booking — your session is only confirmed once payment has been received and you have
                  received a booking confirmation via email.
                </p>
                <p style={bodyStyle}>
                  StudioBooking.co.za reserves the right to:
                </p>
                <ul style={listStyle}>
                  <li>Modify studio schedules or available time slots at any time.</li>
                  <li>Decline or cancel a booking at our discretion, with reasonable notice where possible.</li>
                  <li>Close bookings once a session or date is fully booked.</li>
                  <li>Cancel or reschedule bookings due to circumstances beyond our control, including but not limited
                      to load shedding, technical failures, or emergency closures.</li>
                </ul>
                <p style={bodyStyle}>
                  Where a booking is cancelled by us, we will make reasonable efforts to offer an alternative date or
                  issue a refund of amounts paid.
                </p>
              </section>

              {/* 5. Payments */}
              <section id="payments">
                <SectionHeading number="05" title="Payments" />
                <p style={bodyStyle}>
                  All prices displayed on the Platform are in South African Rand (ZAR) and are inclusive of any
                  applicable taxes unless otherwise stated. Payment in full, including a refundable breakage deposit,
                  is required before a booking is confirmed.
                </p>
                <p style={bodyStyle}>
                  Payments are processed through authorised third-party payment providers. StudioBooking.co.za does
                  not store, process, or have access to your banking or card details. All payment information is
                  handled securely by our payment gateway in accordance with applicable payment card industry standards.
                </p>
                <p style={bodyStyle}>
                  A refundable breakage deposit of R750 is included in every booking total and will be returned within
                  48–72 hours after your session, provided no damage has occurred to studio equipment or property.
                </p>
              </section>

              {/* 6. Cancellation and Refund Policy */}
              <section id="cancellation">
                <SectionHeading number="06" title="Cancellation and Refund Policy" />
                <p style={bodyStyle}>
                  Unless otherwise communicated in writing, the following cancellation policy applies:
                </p>
                <ul style={listStyle}>
                  <li>
                    <strong>Cancellations made more than 24 hours before your booking</strong> may qualify for a
                    full refund or a booking credit, at the discretion of StudioBooking.co.za.
                  </li>
                  <li>
                    <strong>Late cancellations</strong> (within 24 hours of the booking) may result in partial or
                    full forfeiture of the session fee. The refundable deposit will be returned regardless of
                    cancellation timing.
                  </li>
                  <li>
                    <strong>No-shows</strong> are generally non-refundable. If you are unable to attend, please
                    contact us as early as possible to discuss your options.
                  </li>
                </ul>
                <p style={bodyStyle}>
                  All cancellation requests must be submitted in writing to{" "}
                  <a href="mailto:bookings@kyalamistudio.co.za" style={linkStyle}>
                    bookings@kyalamistudio.co.za
                  </a>
                  . Verbal cancellations will not be accepted.
                </p>
                <InfoBox>
                  The R750 breakage deposit is a separate charge and is always refundable upon satisfactory
                  completion of your session, regardless of any cancellation circumstances.
                </InfoBox>
              </section>

              {/* 7. Health and Participation */}
              <section id="health">
                <SectionHeading number="07" title="Health and Participation Disclaimer" />
                <p style={bodyStyle}>
                  By making a booking, you confirm that you and any persons attending the session with you are in
                  suitable physical and mental health to participate in the booked activities. You participate
                  voluntarily and acknowledge that certain activities carried out in the studio may carry inherent
                  physical risks.
                </p>
                <p style={bodyStyle}>
                  If you or any attendee has a medical condition, disability, or other circumstance that may affect
                  your ability to safely participate, we strongly recommend consulting a medical professional before
                  making a booking. StudioBooking.co.za does not provide medical advice and is not responsible for
                  any health consequences arising from your participation.
                </p>
              </section>

              {/* 8. Waiver of Liability */}
              <section id="liability">
                <SectionHeading number="08" title="Waiver of Liability" />
                <p style={bodyStyle}>
                  To the fullest extent permitted by the laws of the Republic of South Africa, StudioBooking.co.za,
                  its owners, directors, employees, contractors, affiliates, and partners shall not be liable for:
                </p>
                <ul style={listStyle}>
                  <li>Personal injury, illness, or death sustained during or as a result of your session.</li>
                  <li>Loss, theft, or damage to personal property brought to the studio.</li>
                  <li>
                    Disruptions to bookings caused by circumstances beyond our reasonable control, including power
                    outages, natural disasters, or infrastructure failures.
                  </li>
                  <li>Indirect, special, or consequential losses arising from your use of the Platform.</li>
                  <li>Loss of data, profits, or business opportunities resulting from the use or inability to use the Platform.</li>
                </ul>
                <p style={bodyStyle}>
                  Nothing in these Terms and Conditions excludes or limits our liability for death or personal injury
                  caused by our negligence, or any other liability that cannot be excluded or limited under South
                  African law.
                </p>
              </section>

              {/* 9. User Conduct */}
              <section id="conduct">
                <SectionHeading number="09" title="User Conduct" />
                <p style={bodyStyle}>
                  When using the Platform or attending sessions, you agree not to:
                </p>
                <ul style={listStyle}>
                  <li>Use the Platform for any unlawful purpose or in violation of any applicable laws or regulations.</li>
                  <li>Provide false, misleading, or fraudulent information in your booking or communications with us.</li>
                  <li>Interfere with or disrupt the operation of the Platform, its servers, or any connected networks.</li>
                  <li>
                    Attempt to gain unauthorised access to any part of the Platform, other user accounts, or any
                    connected systems.
                  </li>
                  <li>Use automated tools, bots, or scripts to access, scrape, or interact with the Platform.</li>
                  <li>Harass, abuse, or threaten other users or members of our staff.</li>
                  <li>
                    Use the studio space for purposes other than those stated in your booking without prior written
                    consent.
                  </li>
                </ul>
                <p style={bodyStyle}>
                  Any breach of these conduct requirements may result in immediate cancellation of your booking,
                  forfeiture of payments made, and/or being banned from future use of the Platform.
                </p>
              </section>

              {/* 10. Intellectual Property */}
              <section id="ip">
                <SectionHeading number="10" title="Intellectual Property" />
                <p style={bodyStyle}>
                  All content on StudioBooking.co.za, including but not limited to logos, trademarks, photographs,
                  graphics, text, page layouts, software, and code, is the property of StudioBooking.co.za or its
                  respective licensors and is protected by South African and international intellectual property laws.
                </p>
                <p style={bodyStyle}>
                  You may not reproduce, distribute, modify, create derivative works from, publicly display, or
                  otherwise exploit any content from the Platform without prior written permission from
                  StudioBooking.co.za. Requests for permission may be directed to{" "}
                  <a href="mailto:bookings@kyalamistudio.co.za" style={linkStyle}>
                    bookings@kyalamistudio.co.za
                  </a>.
                </p>
                <p style={bodyStyle}>
                  Content you create during your booked session remains your intellectual property, subject to any
                  separate agreements made at the time of booking.
                </p>
              </section>

              {/* 11. Privacy and POPIA */}
              <section id="privacy">
                <SectionHeading number="11" title="Privacy and POPIA Compliance" />
                <p style={bodyStyle}>
                  StudioBooking.co.za collects and processes personal information in accordance with the Protection
                  of Personal Information Act 4 of 2013 (POPIA). By using the Platform, you consent to the
                  collection and use of your personal information as described in our{" "}
                  <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>.
                </p>
                <p style={bodyStyle}>
                  Personal information we may collect includes:
                </p>
                <ul style={listStyle}>
                  <li>Full name and identity document details (for booking verification).</li>
                  <li>Email address and contact number.</li>
                  <li>Booking history and session preferences.</li>
                  <li>Banking details provided for deposit refund processing.</li>
                  <li>Payment-related information processed through our authorised payment provider.</li>
                </ul>
                <p style={bodyStyle}>
                  Your personal information is used solely for the purposes of processing and confirming your
                  bookings, communicating with you about your sessions, processing refunds, and complying with our
                  legal obligations. We will not sell, rent, or trade your personal information to third parties
                  for marketing purposes.
                </p>
                <p style={bodyStyle}>
                  You have the right to request access to, correction of, or deletion of your personal information
                  held by us, subject to applicable legal requirements. Please contact us at{" "}
                  <a href="mailto:bookings@kyalamistudio.co.za" style={linkStyle}>
                    bookings@kyalamistudio.co.za
                  </a>{" "}
                  to exercise these rights.
                </p>
              </section>

              {/* 12. Third-Party Services */}
              <section id="third-party">
                <SectionHeading number="12" title="Third-Party Services" />
                <p style={bodyStyle}>
                  The Platform integrates with third-party services to facilitate bookings and payments, including
                  payment gateways, email delivery providers, and analytics tools. When you interact with these
                  services through our Platform, their respective terms of service and privacy policies apply.
                </p>
                <p style={bodyStyle}>
                  StudioBooking.co.za is not responsible for the actions, policies, content, availability, or
                  reliability of any third-party services. We make no representations or warranties regarding
                  third-party services and will not be liable for any loss or damage arising from your use of them.
                </p>
                <p style={bodyStyle}>
                  Links to external websites or services are provided for convenience only and do not constitute
                  an endorsement of those sites or their content.
                </p>
              </section>

              {/* 13. Service Availability */}
              <section id="availability">
                <SectionHeading number="13" title="Service Availability" />
                <p style={bodyStyle}>
                  While we make every reasonable effort to keep the Platform operational and accessible, we cannot
                  guarantee uninterrupted or error-free access. The Platform may be temporarily unavailable due to:
                </p>
                <ul style={listStyle}>
                  <li>Scheduled or emergency maintenance.</li>
                  <li>Technical failures or infrastructure issues.</li>
                  <li>Circumstances beyond our reasonable control (force majeure).</li>
                </ul>
                <p style={bodyStyle}>
                  We will endeavour to provide advance notice of planned maintenance where possible. StudioBooking.co.za
                  shall not be liable for any loss, inconvenience, or damage arising from the temporary unavailability
                  of the Platform.
                </p>
              </section>

              {/* 14. Amendments */}
              <section id="amendments">
                <SectionHeading number="14" title="Amendments" />
                <p style={bodyStyle}>
                  StudioBooking.co.za reserves the right to amend, update, or replace these Terms and Conditions at
                  any time, at our sole discretion. Updated Terms and Conditions will be published on this page and
                  will become effective immediately upon publication.
                </p>
                <p style={bodyStyle}>
                  We encourage you to review these Terms and Conditions periodically to stay informed of any changes.
                  Your continued use of the Platform after any amendments have been published constitutes your
                  acceptance of the updated Terms and Conditions.
                </p>
                <p style={bodyStyle}>
                  Where changes are material, we will make reasonable efforts to notify users via email or a
                  prominent notice on the Platform prior to the changes taking effect.
                </p>
              </section>

              {/* 15. Governing Law */}
              <section id="governing-law">
                <SectionHeading number="15" title="Governing Law" />
                <p style={bodyStyle}>
                  These Terms and Conditions are governed by and construed in accordance with the laws of the
                  Republic of South Africa. Any dispute arising from or in connection with these Terms and Conditions
                  — including any question regarding their existence, validity, or termination — shall be subject
                  to the exclusive jurisdiction of the courts of South Africa.
                </p>
                <p style={bodyStyle}>
                  We encourage users to resolve any disputes informally by contacting us directly before initiating
                  formal legal proceedings. We are committed to addressing concerns promptly and in good faith.
                </p>
              </section>

              {/* 16. Contact Information */}
              <section id="contact">
                <SectionHeading number="16" title="Contact Information" />
                <p style={bodyStyle}>
                  If you have any questions, concerns, or requests regarding these Terms and Conditions, please
                  contact us using the details below:
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
                    We aim to respond to all enquiries within 1–2 business days.
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
                  <Link href="/privacy" style={{ fontSize: 13, color: "#a87d36", textDecoration: "none" }}>
                    Privacy Policy
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

      {/* Responsive and hover styles */}
      <style>{`
        .terms-toc a:hover { color: #c8984a !important; }
        @media (max-width: 768px) {
          .terms-layout {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .terms-toc {
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

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
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
