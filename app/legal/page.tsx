import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy & Terms | CoupleIQ",
  description: "Privacy policy and terms of service for CoupleIQ — the relationship health analyzer at splitornot.com.",
  alternates: { canonical: "https://splitornot.com/legal" },
};

const LAST_UPDATED = "18 April 2025";
const CONTACT     = "support.coupleiq@gmail.com";
const SITE        = "splitornot.com";

export default function LegalPage() {
  return (
    <main style={{ background: "#f0efed", minHeight: "100vh", padding: "2rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 680 }}>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/logo.png" alt="CoupleIQ" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
              Couple<span style={{ color: "#534ab7" }}>IQ</span>
            </span>
          </Link>
          <Link href="/" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>← Back to home</Link>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #efefed", padding: "2.5rem 2rem" }}>

          <p style={{ fontSize: 12, color: "#bbb", marginBottom: 8, fontWeight: 500 }}>Last updated: {LAST_UPDATED}</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            Privacy Policy & Terms of Service
          </h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #f5f5f3" }}>
            This document covers both our Privacy Policy and Terms of Service for <strong>CoupleIQ</strong>, accessible at <strong>{SITE}</strong>. By using CoupleIQ you agree to both.
          </p>

          {/* PRIVACY POLICY */}
          <Section title="Privacy Policy">

            <SubSection title="1. What information we collect">
              <p>CoupleIQ is designed to collect as little information as possible.</p>
              <ul>
                <li><strong>Quiz answers:</strong> Your responses to the 15 assessment questions are sent to our AI analysis service (Anthropic Claude) to generate your result. They are processed in real time and are <strong>not stored on our servers</strong> after your result is generated.</li>
                <li><strong>Payment information:</strong> If you purchase the full report, your payment is processed by Stripe. We never see or store your card details. Stripe may store payment data in accordance with their own privacy policy.</li>
                <li><strong>Email address:</strong> If you contact us at {CONTACT}, we will store your email to respond to your query. We do not add you to any mailing list without your explicit consent.</li>
                <li><strong>Analytics:</strong> We use Google Analytics to understand how people use the site (pages visited, time spent, general location by country). This data is anonymised and aggregated.</li>
                <li><strong>Local storage:</strong> Your quiz result is temporarily stored in your browser's local storage so it survives the Stripe payment redirect. This data lives only in your browser and is never sent to us. It disappears when you clear your browser data.</li>
              </ul>
            </SubSection>

            <SubSection title="2. How we use your information">
              <ul>
                <li>To generate your relationship health assessment</li>
                <li>To process payments for the full report</li>
                <li>To respond to support requests</li>
                <li>To understand and improve how the product is used (via anonymised analytics)</li>
              </ul>
              <p>We do not sell your data. We do not share your data with third parties except as necessary to provide the service (Anthropic for AI analysis, Stripe for payments, Google for analytics).</p>
            </SubSection>

            <SubSection title="3. Cookies">
              <p>We use minimal cookies — primarily for Google Analytics session tracking. We do not use advertising cookies or tracking pixels. You can disable cookies in your browser settings without affecting core functionality.</p>
            </SubSection>

            <SubSection title="4. Your rights (GDPR & UK GDPR)">
              <p>If you are in the European Union or United Kingdom, you have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Object to or restrict how we process your data</li>
                <li>Data portability</li>
              </ul>
              <p>Since we store almost no personal data, most requests will be straightforward to fulfil. Contact us at <strong>{CONTACT}</strong> and we will respond within 30 days.</p>
            </SubSection>

            <SubSection title="5. Data retention">
              <p>Quiz answers are not retained after your result is generated. Payment records are retained by Stripe per their data retention policy. Support emails are retained for up to 12 months. Analytics data is retained per Google Analytics' default settings (26 months).</p>
            </SubSection>

            <SubSection title="6. Third-party services">
              <ul>
                <li><strong>Anthropic</strong> — AI analysis engine. <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Anthropic Privacy Policy</a></li>
                <li><strong>Stripe</strong> — payment processing. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a></li>
                <li><strong>Google Analytics</strong> — anonymised usage analytics. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                <li><strong>Vercel</strong> — website hosting. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a></li>
              </ul>
            </SubSection>

          </Section>

          {/* TERMS OF SERVICE */}
          <Section title="Terms of Service">

            <SubSection title="1. Acceptance of terms">
              <p>By accessing or using CoupleIQ at {SITE}, you agree to these terms. If you do not agree, please do not use the service.</p>
            </SubSection>

            <SubSection title="2. What CoupleIQ is — and is not">
              <p>CoupleIQ is an <strong>informational tool</strong> designed to help people reflect on their relationship patterns using research-based frameworks. It is <strong>not</strong>:</p>
              <ul>
                <li>A substitute for professional couples therapy or counselling</li>
                <li>A clinical diagnosis or medical advice</li>
                <li>A definitive prediction of relationship outcomes</li>
              </ul>
              <p>Results are based on self-reported answers from one perspective and should be interpreted as a starting point for reflection, not a verdict.</p>
            </SubSection>

            <SubSection title="3. Payments and refunds">
              <p>The full report is available for a one-time payment of $4.99, processed securely by Stripe. Due to the digital nature of the product, we do not offer refunds once the full report has been delivered. If you experienced a technical issue and did not receive your report, contact us at <strong>{CONTACT}</strong> within 7 days and we will resolve it promptly.</p>
            </SubSection>

            <SubSection title="4. Acceptable use">
              <p>You agree not to use CoupleIQ to:</p>
              <ul>
                <li>Attempt to reverse-engineer, scrape, or copy the service</li>
                <li>Submit false or misleading information with intent to manipulate results</li>
                <li>Use the service for any unlawful purpose</li>
              </ul>
            </SubSection>

            <SubSection title="5. Intellectual property">
              <p>All content, design, and code on CoupleIQ is owned by or licensed to us. You may not reproduce, distribute, or create derivative works without our written permission.</p>
            </SubSection>

            <SubSection title="6. Limitation of liability">
              <p>CoupleIQ is provided "as is" without warranties of any kind. We are not liable for any decisions made on the basis of CoupleIQ results, or for any indirect, incidental, or consequential damages arising from use of the service. Our total liability for any claim shall not exceed the amount you paid for the service.</p>
            </SubSection>

            <SubSection title="7. Changes to these terms">
              <p>We may update this document from time to time. The date at the top of this page reflects the most recent revision. Continued use of CoupleIQ after changes constitutes acceptance of the updated terms.</p>
            </SubSection>

            <SubSection title="8. Contact">
              <p>For any questions about this document, contact us at <strong>{CONTACT}</strong>. We aim to respond within 48 hours.</p>
            </SubSection>

          </Section>

        </div>

        <p style={{ marginTop: "1.5rem", fontSize: 12, color: "#ccc", textAlign: "center" }}>
          CoupleIQ · splitornot.com · {LAST_UPDATED}
        </p>
      </div>
    </main>
  );
}

/* ─── Layout helpers ────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: "1.25rem", paddingTop: "1.5rem", borderTop: "1px solid #f5f5f3" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: "0.5rem" }}>{title}</h3>
      <div style={{ fontSize: 14, color: "#555", lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}
