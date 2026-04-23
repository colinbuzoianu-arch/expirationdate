"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { steps } from "@/lib/questions";
import { Answers, ExpirationResult } from "@/lib/types";

type Screen = "landing" | "quiz" | "loading" | "result" | "error";

// ── Logo SVG Component ──────────────────────────────────────────────
function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#1A1510"/>
      {/* Hourglass shape */}
      <path d="M11 9h18v5.5l-7 5.5 7 5.5V31H11v-5.5l7-5.5-7-5.5V9z" fill="#D94F3D" opacity="0.15"/>
      <path d="M11 9h18v5.5l-7 5.5 7 5.5V31H11v-5.5l7-5.5-7-5.5V9z" stroke="#D94F3D" strokeWidth="1.5" fill="none"/>
      {/* Sand top (full) */}
      <path d="M12.5 10.5h15L21 15.5l-2 1.5-2-1.5-4.5-5z" fill="#D94F3D" opacity="0.7"/>
      {/* Sand bottom (partial - running out) */}
      <path d="M16 27.5h8l-4-3.5-4 3.5z" fill="#D94F3D" opacity="0.5"/>
      {/* Center drip */}
      <circle cx="20" cy="21" r="1.2" fill="#D94F3D"/>
      {/* Top/bottom bars */}
      <rect x="11" y="9" width="18" height="1.5" rx="0.75" fill="#D94F3D"/>
      <rect x="11" y="29.5" width="18" height="1.5" rx="0.75" fill="#D94F3D"/>
    </svg>
  );
}

// ── Wordmark ────────────────────────────────────────────────────────
function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 8 : 10 }}>
      <Logo size={compact ? 32 : 40} />
      <div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: compact ? 20 : 26,
          letterSpacing: "0.04em",
          color: "#1A1510",
          lineHeight: 1,
        }}>
          EXPIRATION DATE
        </div>
        {!compact && (
          <div style={{ fontSize: 10, color: "#8A8278", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>
            Relationship Forecast
          </div>
        )}
      </div>
    </div>
  );
}

// ── Risk colors ─────────────────────────────────────────────────────
const riskConfig = {
  Strong:   { color: "#3D8B6E", bg: "#E4F2EC", border: "#B5DCCF", label: "LASTING" },
  Fragile:  { color: "#E8974A", bg: "#FDF3E7", border: "#F4CFA0", label: "FRAGILE" },
  Critical: { color: "#D94F3D", bg: "#FAEAE8", border: "#F4B5AE", label: "CRITICAL" },
  Terminal: { color: "#8B1A1A", bg: "#F5E4E4", border: "#DCA8A8", label: "TERMINAL" },
};

const urgencyConfig = {
  "lasting":      { icon: "✦", label: "Keep doing what you're doing" },
  "watch closely":{ icon: "◈", label: "Worth watching closely" },
  "act soon":     { icon: "◉", label: "Act soon" },
  "act now":      { icon: "⬥", label: "Act now — urgently" },
};

// ── Main Page ───────────────────────────────────────────────────────
function HomeInner() {
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<Screen>("landing");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<ExpirationResult | null>(null);
  const [resultToken, setResultToken] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const appRef = useRef<HTMLDivElement>(null);

  const scrollToApp = () => appRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const startQuiz = () => {
    setScreen("quiz");
    setTimeout(() => appRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleChange = (id: string, value: string | number) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const scrollToTop = () => {
    // Scroll the app card into view, then nudge to the very top
    appRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = async () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
      setTimeout(scrollToTop, 30);
    } else {
      await runAnalysis();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      setTimeout(scrollToTop, 30);
    }
  };

  const handleNavigate = (index: number) => {
    if (index < stepIndex) {
      setStepIndex(index);
      setTimeout(scrollToTop, 30);
    }
  };

  const runAnalysis = async () => {
    setScreen("loading");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Unknown error");
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      setResultToken(token);
      localStorage.setItem(`exp_result_${token}`, JSON.stringify(data));
      setIsPaid(false);
      setResult(data as ExpirationResult);
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setScreen("error");
    }
  };

  const handleUnlock = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultToken }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Could not start checkout. Please try again.");
    }
  };

  const restart = () => {
    setScreen("landing");
    setStepIndex(0); setAnswers({}); setResult(null);
    setResultToken(""); setIsPaid(false); setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showLanding = screen === "landing";
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const allAnswered = step?.questions.every((q) => {
    if (q.type === "textarea") return true;
    return answers[q.id] !== undefined;
  });

  const faqs = [
    {
      q: "Is the expiration date actually accurate?",
      a: "It's a data-driven prediction based on relationship research, not a prophecy. The algorithm applies the same behavioral signals relationship scientists use to predict outcomes — contempt, repair patterns, goal alignment, intimacy trajectories. Treat it as a probability, not a sentence.",
    },
    {
      q: "This feels dark. Why would I want this?",
      a: "Because denial is darker. Couples who ignore warning signs for years look back and say 'we knew.' This gives you the information while there's still time to do something about it — or to confirm that you're genuinely solid.",
    },
    {
      q: "Does my partner need to take it?",
      a: "No — and comparing results is often where the real insight lives. You can each take it separately and compare. The gap between your predictions is itself data.",
    },
    {
      q: "What does the paid report include?",
      a: "The free result shows your expiration date and risk level. The paid report ($4.99) unlocks the full factor breakdown, the specific patterns driving the prediction, three concrete action steps, and a shareable result card.",
    },
    {
      q: "Do you store my answers?",
      a: "No. Your answers are processed in real time and never stored on our servers. Results are saved in your browser only — if you close the tab, they're gone.",
    },
  ];

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={{
        background: "rgba(250,247,242,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 1.5rem",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Wordmark compact={true} />
        <button
          onClick={showLanding ? startQuiz : scrollToApp}
          style={{
            background: "var(--ink)", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 20px",
            fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 15,
          }}
        >
          FIND OUT NOW
        </button>
      </nav>

      {/* ── LANDING ── */}
      {showLanding && (
        <>
          {/* HERO */}
          <section style={{ maxWidth: 780, margin: "0 auto", padding: "5rem 1.5rem 3rem", textAlign: "center" }}>
            <div className="fade-up" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--red-light)", border: "1px solid var(--red-mid)",
              borderRadius: 20, padding: "6px 16px", marginBottom: "2rem",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", display: "inline-block", animation: "pulse-red 2s infinite" }} />
              <span style={{ fontSize: 11, color: "var(--red-dark)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Relationship Algorithm
              </span>
            </div>

            <h1 className="fade-up-d1" style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(52px, 10vw, 100px)",
              letterSpacing: "0.02em",
              color: "var(--ink)",
              lineHeight: 0.95,
              marginBottom: "1rem",
            }}>
              YOUR RELATIONSHIP<br />
              <span style={{ color: "var(--red)" }}>HAS AN</span><br />
              EXPIRATION DATE
            </h1>

            <p className="fade-up-d2" style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(18px, 3vw, 24px)",
              color: "#5C544A",
              lineHeight: 1.6,
              maxWidth: 560, margin: "0 auto 0.75rem",
              fontStyle: "italic",
            }}>
              10 brutally honest questions. Our AI predicts the literal month and year your relationship ends — or confirms it won't.
            </p>

            <p className="fade-up-d2" style={{ fontSize: 14, color: "var(--muted)", marginBottom: "2.5rem" }}>
              "Our app says we have 14 months left." Find out yours.
            </p>

            <div className="fade-up-d3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={startQuiz}
                style={{
                  background: "var(--red)", color: "#fff", border: "none",
                  borderRadius: 12, padding: "18px 40px",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 22, letterSpacing: "0.06em",
                  cursor: "pointer", transition: "transform 0.1s, background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-dark)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--red)")}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                CALCULATE MY DATE
              </button>
              <button
                onClick={scrollToApp}
                style={{
                  background: "transparent", color: "var(--muted)",
                  border: "1px solid var(--border)", borderRadius: 12,
                  padding: "18px 28px", fontSize: 14, fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                See how it works ↓
              </button>
            </div>
            <p className="fade-up-d4" style={{ marginTop: "1rem", fontSize: 12, color: "#C5BDB3" }}>
              Free to start · Private · No account needed · Takes 3 minutes
            </p>
          </section>

          {/* STATS BAR */}
          <section style={{ background: "var(--ink)", padding: "2.5rem 1.5rem" }}>
            <div style={{
              maxWidth: 780, margin: "0 auto",
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "2rem", textAlign: "center",
            }}>
              {[
                { n: "68%", label: "of couples who broke up say they 'saw it coming'" },
                { n: "2.4 yrs", label: "average time couples ignore problems before acting" },
                { n: "3 min", label: "to get your expiration date right now" },
              ].map((s) => (
                <div key={s.n}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "var(--red)", letterSpacing: "0.04em", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: "#8A8278", lineHeight: 1.6, marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section style={{ maxWidth: 780, margin: "0 auto", padding: "5rem 1.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: "0.04em", color: "var(--ink)", lineHeight: 1 }}>
                HOW THE ALGORITHM WORKS
              </h2>
              <p style={{ fontSize: 15, color: "var(--muted)", marginTop: "0.5rem" }}>
                Brutal honesty. Scientific backbone.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  n: "01", title: "10 questions. No fluff.",
                  body: "We ask only what predicts outcomes: contempt frequency, intimacy trends, goal alignment, repair patterns, gut feeling. We cut everything that doesn't matter."
                },
                {
                  n: "02", title: "The algorithm runs.",
                  body: "Built on Gottman's 40 years of research, attachment theory, and longitudinal breakup data — weighted for what actually predicts endings, not what makes you feel better."
                },
                {
                  n: "03", title: "You get a date.",
                  body: "Not a vague 'moderate risk.' A specific month and year — or confirmation that we can't find one. Free result shows the date. Paid unlocks every factor driving it."
                },
              ].map((s) => (
                <div key={s.n} style={{
                  display: "flex", gap: 20, background: "var(--white)",
                  borderRadius: 16, padding: "1.5rem",
                  border: "1px solid var(--border)", alignItems: "flex-start",
                  boxShadow: "var(--card-shadow)",
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 13, color: "var(--red)", background: "var(--red-light)",
                    borderRadius: 8, padding: "6px 10px", flexShrink: 0, letterSpacing: "0.08em",
                    border: "1px solid var(--red-mid)",
                  }}>{s.n}</div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 6, letterSpacing: "-0.01em" }}>{s.title}</p>
                    <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <button
                onClick={startQuiz}
                style={{
                  background: "var(--red)", color: "#fff", border: "none",
                  borderRadius: 12, padding: "16px 40px",
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
                  letterSpacing: "0.06em", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-dark)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--red)")}
              >
                GET MY EXPIRATION DATE
              </button>
            </div>
          </section>

          {/* VIRAL HOOK SECTION */}
          <section style={{ background: "var(--ink)", padding: "5rem 1.5rem" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
              <p style={{
                fontFamily: "'DM Serif Display', serif", fontStyle: "italic",
                fontSize: "clamp(24px, 5vw, 42px)", color: "var(--red)",
                lineHeight: 1.3, marginBottom: "1.5rem",
              }}>
                "Our app says we have 14 months left."
              </p>
              <p style={{ fontSize: 15, color: "#8A8278", lineHeight: 1.8, marginBottom: "2rem" }}>
                That sentence went viral. Not because it's morbid — but because people immediately wanted to know <em style={{ color: "#C5BDB3" }}>their</em> number. Some couples used it to finally have the conversation they'd been avoiding. Others showed each other and laughed with relief. A few cried. All of them knew something real.
              </p>
              <button
                onClick={startQuiz}
                style={{
                  background: "var(--red)", color: "#fff", border: "none",
                  borderRadius: 12, padding: "16px 36px",
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 18,
                  letterSpacing: "0.06em", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-dark)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--red)")}
              >
                WHAT'S MY NUMBER?
              </button>
            </div>
          </section>

          {/* WHAT YOU GET */}
          <section style={{ maxWidth: 780, margin: "0 auto", padding: "5rem 1.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: "0.04em", color: "var(--ink)" }}>
                FREE VS FULL REPORT
              </h2>
              <p style={{ fontSize: 15, color: "var(--muted)", marginTop: "0.5rem" }}>Start free. Unlock everything for $4.99.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <div style={{ borderRadius: 16, border: "1px solid var(--border)", padding: "1.75rem", background: "#F5F2EE" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>Free</p>
                {["Your expiration date (or 'No expiration')", "Risk level: Strong / Fragile / Critical / Terminal", "Your relationship pattern name", "The biggest threat and biggest strength"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, fontSize: 13, color: "#4A4440" }}>
                    <span style={{ color: "var(--green)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <div style={{ borderRadius: 16, border: "2px solid var(--red)", padding: "1.75rem", background: "var(--white)", position: "relative", boxShadow: "var(--card-shadow)" }}>
                <div style={{
                  position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                  background: "var(--red)", color: "#fff", fontWeight: 700,
                  padding: "4px 16px", borderRadius: 20, letterSpacing: "0.08em",
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, whiteSpace: "nowrap",
                }}>FULL REPORT — $4.99</div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>Everything in Free, plus</p>
                {[
                  "Complete factor breakdown with severity weights",
                  "The exact behavioral pattern driving the prediction",
                  "3 specific, named action steps",
                  "Overall urgency verdict",
                  "Shareable result card to send (or confront) your partner",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, fontSize: 13, color: "var(--ink)" }}>
                    <span style={{ color: "var(--red)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section style={{ background: "var(--white)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ maxWidth: 780, margin: "0 auto", padding: "4rem 1.5rem" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: "0.04em", color: "var(--ink)", textAlign: "center", marginBottom: "2.5rem" }}>
                WHAT PEOPLE ARE SAYING
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { quote: "It said 8 months. We had a 3-hour conversation that night we'd been avoiding for 2 years. We're in couples therapy now.", name: "Ana R.", tag: "Together 4 years" },
                  { quote: "I showed my boyfriend and we both laughed — 'No expiration detected.' It was the validation we needed.", name: "Mika T.", tag: "Dating 2 years" },
                  { quote: "The pattern it named — 'The Roommate Dynamic' — hit so hard I couldn't speak. Shared it with her. We're figuring it out.", name: "James K.", tag: "Married 7 years" },
                ].map((t, i) => (
                  <div key={i} style={{ background: "var(--cream)", borderRadius: 16, padding: "1.5rem", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                      {[1,2,3,4,5].map((s) => <span key={s} style={{ color: "#E8974A", fontSize: 14 }}>★</span>)}
                    </div>
                    <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.7, marginBottom: 12, fontStyle: "italic" }}>"{t.quote}"</p>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: "var(--muted)" }}>{t.tag}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section style={{ maxWidth: 780, margin: "0 auto", padding: "5rem 1.5rem" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: "0.04em", color: "var(--ink)", textAlign: "center", marginBottom: "2.5rem" }}>
              COMMON QUESTIONS
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%", background: openFaq === i ? "var(--white)" : "var(--cream)",
                      border: "none", padding: "1rem 1.25rem", textAlign: "left",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      cursor: "pointer", gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", lineHeight: 1.4 }}>{faq.q}</span>
                    <span style={{
                      fontSize: 20, color: "var(--red)", flexShrink: 0,
                      transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)",
                    }}>+</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "0 1.25rem 1rem", background: "var(--white)" }}>
                      <p style={{ fontSize: 14, color: "#5C544A", lineHeight: 1.7 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* FINAL CTA */}
          <section style={{ background: "var(--ink)", padding: "6rem 1.5rem", textAlign: "center" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 8vw, 72px)", color: "var(--white)", lineHeight: 0.95, marginBottom: "1.5rem", letterSpacing: "0.02em" }}>
                MOST COUPLES<br /><span style={{ color: "var(--red)" }}>ALREADY KNOW.</span><br />THEY JUST WON'T<br />LOOK.
              </div>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 18, color: "#8A8278", lineHeight: 1.7, marginBottom: "2.5rem" }}>
                Take 3 minutes. Get an honest answer. Either you'll be relieved — or you'll finally have the information you need to act.
              </p>
              <button
                onClick={startQuiz}
                style={{
                  background: "var(--red)", color: "#fff", border: "none",
                  borderRadius: 12, padding: "20px 48px",
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 24,
                  letterSpacing: "0.06em", cursor: "pointer",
                  transition: "background 0.15s, transform 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-dark)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--red)")}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                FIND OUT MY DATE
              </button>
              <p style={{ marginTop: "1rem", fontSize: 12, color: "#4A4440" }}>Free to start · Private · No account</p>
            </div>
          </section>
        </>
      )}

      {/* ── APP AREA (quiz / loading / result / error) ── */}
      <div ref={appRef} style={{ padding: showLanding ? "2rem 1rem 4rem" : "2rem 1rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {!showLanding && (
          <div style={{
            background: "var(--white)", borderRadius: 20,
            border: "1px solid var(--border)", padding: "1.75rem",
            width: "100%", maxWidth: 640, boxShadow: "var(--card-shadow)",
          }}>
            {/* Header */}
            {(screen === "quiz" || screen === "loading") && (
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <Wordmark compact={true} />
              </div>
            )}

            {/* QUIZ */}
            {screen === "quiz" && step && (
              <div>
                {/* Progress */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.04em" }}>
                    Step {stepIndex + 1} of {steps.length}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>{step.title}</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: "1.75rem" }}>
                  {steps.map((_, i) => {
                    const isCompleted = i < stepIndex;
                    const isActive = i === stepIndex;
                    return (
                      <div
                        key={i}
                        onClick={() => { if (isCompleted) handleNavigate(i); }}
                        title={isCompleted ? `Back to step ${i + 1}: ${steps[i].title}` : undefined}
                        style={{
                          flex: isActive ? "0 0 28px" : "0 0 8px",
                          height: 8, borderRadius: 4,
                          background: i <= stepIndex ? "var(--red)" : "var(--border)",
                          opacity: isCompleted ? 0.5 : 1,
                          transition: "flex 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.25s, opacity 0.15s",
                          cursor: isCompleted ? "pointer" : "default",
                        }}
                        onMouseEnter={(e) => { if (isCompleted) (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                        onMouseLeave={(e) => { if (isCompleted) (e.currentTarget as HTMLDivElement).style.opacity = "0.5"; }}
                      />
                    );
                  })}
                </div>

                {/* Questions */}
                {step.questions.map((q) => {
                  const val = answers[q.id];
                  const pct = q.type === "range" ? (((val as number ?? q.default ?? 5) - (q.min ?? 1)) / ((q.max ?? 10) - (q.min ?? 1))) * 100 : 50;
                  return (
                    <div key={q.id} style={{ marginBottom: "1.75rem" }}>
                      <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: "0.5rem", lineHeight: 1.5 }}>
                        {q.label}
                      </label>
                      {q.sub && (
                        <span style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: "0.75rem", fontStyle: "italic" }}>
                          {q.sub}
                        </span>
                      )}
                      {q.type === "options" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {q.options!.map((opt) => {
                            const sel = val === opt;
                            return (
                              <OptionButton
                                key={opt}
                                label={opt}
                                selected={sel}
                                onClick={() => handleChange(q.id, opt)}
                              />
                            );
                          })}
                        </div>
                      )}
                      {q.type === "range" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ textAlign: "center", fontSize: 40, fontFamily: "'Bebas Neue', sans-serif", color: "var(--red)", letterSpacing: "0.04em", lineHeight: 1 }}>
                            {(val as number) ?? q.default}
                            <span style={{ fontSize: 18, color: "var(--muted)", fontFamily: "DM Sans, sans-serif" }}>/10</span>
                          </div>
                          <input type="range" min={q.min} max={q.max} step={1}
                            value={(val as number) ?? q.default}
                            style={{ "--pct": `${pct}%` } as React.CSSProperties}
                            onChange={(e) => handleChange(q.id, parseInt(e.target.value))}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                            <span>{q.minLabel}</span><span>{q.maxLabel}</span>
                          </div>
                        </div>
                      )}
                      {q.type === "textarea" && (
                        <textarea
                          placeholder="Optional — leave blank if nothing specific"
                          value={(val as string) || ""}
                          onChange={(e) => handleChange(q.id, e.target.value)}
                          style={{
                            width: "100%", border: "1px solid var(--border)", borderRadius: 12,
                            padding: "12px 14px", fontSize: 14, color: "var(--ink)",
                            background: "#FAFAF8", resize: "vertical", minHeight: 84,
                            lineHeight: 1.6, outline: "none", fontFamily: "inherit",
                            transition: "border-color 0.15s",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--red)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Nav */}
                <div style={{ display: "flex", gap: 12, marginTop: "1.75rem" }}>
                  {stepIndex > 0 && (
                    <button onClick={handleBack} style={{
                      background: "transparent", border: "1px solid var(--border)",
                      borderRadius: 12, padding: "13px 20px", fontSize: 14,
                      color: "var(--muted)", cursor: "pointer",
                    }}>Back</button>
                  )}
                  <button onClick={handleNext} disabled={!allAnswered} style={{
                    flex: 1, background: allAnswered ? "var(--red)" : "#E8D9D7",
                    color: "#fff", border: "none", borderRadius: 12,
                    padding: "14px 20px", fontWeight: 700,
                    cursor: allAnswered ? "pointer" : "not-allowed",
                    fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em", fontSize: 18,
                    transition: "background 0.2s, transform 0.1s",
                  }}
                    onMouseDown={(e) => { if (allAnswered) e.currentTarget.style.transform = "scale(0.98)"; }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    {isLastStep ? "CALCULATE MY DATE" : "CONTINUE →"}
                  </button>
                </div>
              </div>
            )}

            {/* LOADING */}
            {screen === "loading" && <LoadingScreen />}

            {/* RESULT */}
            {screen === "result" && result && (
              <ResultScreen result={result} isPaid={isPaid} onUnlock={handleUnlock} onRestart={restart} />
            )}

            {/* ERROR */}
            {screen === "error" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ background: "var(--red-light)", border: "1px solid var(--red-mid)", borderRadius: 12, padding: "1rem", fontSize: 14, color: "var(--red-dark)", marginBottom: "1rem" }}>
                  {errorMsg}
                </div>
                <button onClick={restart} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 20px", fontSize: 14, color: "var(--muted)", width: "100%", cursor: "pointer" }}>
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #2A2520", background: "var(--ink)", padding: "3rem 1.5rem 2rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* Top row: Expiration Date wordmark + CoupleIQ branding */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 20, marginBottom: "2rem",
            paddingBottom: "2rem", borderBottom: "1px solid #2A2520",
          }}>
            <Wordmark compact={true} />

            {/* CoupleIQ branding */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: "#4A4440", letterSpacing: "0.06em", textTransform: "uppercase" }}>A product by</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src="/coupleiq_logo.png"
                  alt="CoupleIQ"
                  style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }}
                />
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#C5BAB2", letterSpacing: "-0.01em" }}>
                    Couple<span style={{ color: "#D94F3D" }}>IQ</span>
                  </span>
                  <p style={{ fontSize: 9, color: "#4A4440", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 }}>
                    Relationship Health
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle row: tagline + support */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 16,
            justifyContent: "space-between", alignItems: "flex-start",
            marginBottom: "1.75rem",
          }}>
            <div>
              <p style={{ fontSize: 12, color: "#4A4440", lineHeight: 1.8 }}>
                Built on relationship science · Powered by Claude AI<br />
                No answers stored · Private by design
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "#4A4440", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Support</p>
              <a
                href="mailto:support.coupleiq@gmail.com"
                style={{ fontSize: 13, color: "#D94F3D", textDecoration: "none", fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                support.coupleiq@gmail.com
              </a>
            </div>
          </div>

          {/* Bottom row: copyright + legal */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 11, color: "#332E2A" }}>
              © {new Date().getFullYear()} CoupleIQ · For informational purposes only · Not a substitute for couples therapy
            </p>
            <a href="/legal" style={{ fontSize: 11, color: "#4A4440", textDecoration: "underline" }}>Privacy & Terms</a>
          </div>

        </div>
      </footer>
    </div>
  );
}

// ── Loading Screen ──────────────────────────────────────────────────
const LOADING_MESSAGES = [
  { text: "Reading your conflict patterns…",    sub: "This usually takes 15–20 seconds" },
  { text: "Mapping your intimacy trajectory…",  sub: "Almost there — hang tight" },
  { text: "Weighing deal-breaker risk…",        sub: "The algorithm is thorough" },
  { text: "Checking repair dynamics…",          sub: "Nearly done…" },
  { text: "Calculating your expiration date…",  sub: "Just a few more seconds" },
  { text: "Finalising the verdict…",            sub: "Almost there ✦" },
];

function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = () => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
        setVisible(true);
      }, 350);
    };
    const id = setInterval(cycle, 3200);
    return () => clearInterval(id);
  }, []);

  const msg = LOADING_MESSAGES[msgIdx];

  return (
    <div style={{ textAlign: "center", padding: "3.5rem 1rem" }}>
      {/* Hourglass spinner */}
      <div style={{ position: "relative", width: 56, height: 56, margin: "0 auto 2rem" }}>
        <div style={{
          width: 56, height: 56,
          border: "3px solid var(--red-light)",
          borderTopColor: "var(--red)",
          borderRadius: "50%",
          animation: "spin 0.9s linear infinite",
        }} />
        <svg
          style={{ position: "absolute", inset: 0, margin: "auto", width: 24, height: 24 }}
          viewBox="0 0 40 40" fill="none"
        >
          <path d="M11 9h18v5.5l-7 5.5 7 5.5V31H11v-5.5l7-5.5-7-5.5V9z" stroke="#D94F3D" strokeWidth="2" fill="none" opacity=".5"/>
          <path d="M12.5 10.5h15L21 15.5l-2 1.5-2-1.5-4.5-5z" fill="#D94F3D" opacity=".7"/>
          <circle cx="20" cy="21" r="1.5" fill="#D94F3D"/>
        </svg>
      </div>

      {/* Rotating headline */}
      <p style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 24, letterSpacing: "0.06em", color: "var(--ink)",
        marginBottom: 8,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}>
        {msg.text}
      </p>

      {/* Sub-message */}
      <p style={{
        fontSize: 13, color: "var(--muted)", lineHeight: 1.6,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease 0.05s",
        marginBottom: "2rem",
      }}>
        {msg.sub}
      </p>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {LOADING_MESSAGES.map((_, i) => (
          <div key={i} style={{
            width: i === msgIdx ? 20 : 6,
            height: 6, borderRadius: 3,
            background: i <= msgIdx ? "var(--red)" : "var(--border)",
            opacity: i < msgIdx ? 0.35 : 1,
            transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.25s",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Option Button with spring tap animation ──────────────────────────
function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const [pressing, setPressing] = useState(false);
  const [justSelected, setJustSelected] = useState(false);

  const handleClick = () => {
    if (selected) return;
    setPressing(true);
    setTimeout(() => {
      setPressing(false);
      setJustSelected(true);
      onClick();
      setTimeout(() => setJustSelected(false), 500);
    }, 120);
  };

  const scale = pressing ? 0.96 : justSelected ? 1.025 : 1;
  const bg = selected ? "var(--red-light)" : pressing ? "#F5EDEC" : "#FAFAF8";
  const border = selected
    ? "1.5px solid var(--red)"
    : pressing
    ? "1.5px solid #E8A09A"
    : "1px solid var(--border)";
  const color = selected ? "var(--red-dark)" : pressing ? "#5C544A" : "#2A2520";

  return (
    <button
      onClick={handleClick}
      style={{
        background: bg,
        border,
        borderRadius: 12,
        padding: "12px 16px",
        textAlign: "left",
        fontSize: 14,
        color,
        fontWeight: selected ? 600 : 400,
        lineHeight: 1.45,
        cursor: "pointer",
        width: "100%",
        transform: `scale(${scale})`,
        transition: pressing
          ? "transform 0.1s ease, background 0.1s, border 0.1s, color 0.1s"
          : "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.18s, border 0.18s, color 0.18s",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <span>{label}</span>
      {selected && (
        <span style={{
          width: 18, height: 18, borderRadius: "50%",
          background: "var(--red)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, flexShrink: 0,
          animation: "fadeIn 0.2s ease",
        }}>✓</span>
      )}
    </button>
  );
}

// ── Result Screen ───────────────────────────────────────────────────
function ResultScreen({ result, isPaid, onUnlock, onRestart }: {
  result: ExpirationResult;
  isPaid: boolean;
  onUnlock: () => void;
  onRestart: () => void;
}) {
  const rc = riskConfig[result.riskLevel] ?? riskConfig.Fragile;
  const urg = urgencyConfig[result.urgency] ?? urgencyConfig["watch closely"];
  const isGood = result.riskLevel === "Strong";
  const posFactors = result.factors.filter((f) => f.positive);
  const negFactors = result.factors.filter((f) => !f.positive);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* EXPIRATION DATE HERO */}
      <div className="fade-up" style={{
        borderRadius: 16, overflow: "hidden",
        border: `2px solid ${rc.border}`,
        background: rc.bg,
      }}>
        {/* Top bar */}
        <div style={{
          background: rc.color, padding: "10px 20px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: "0.12em", color: "#fff", opacity: 0.9 }}>
            EXPIRATION DATE REPORT
          </span>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: "0.1em",
            color: "#fff", background: "rgba(255,255,255,0.2)", borderRadius: 20,
            padding: "2px 10px",
          }}>{rc.label}</span>
        </div>
        {/* Date display */}
        <div style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: rc.color, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, opacity: 0.8 }}>
            {isGood ? "Status" : "Predicted End Date"}
          </p>
          {/* DATE — locked behind paywall unless Strong (always shown) or paid */}
          {isPaid || isGood ? (
            <p style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: isGood ? 36 : "clamp(36px, 8vw, 56px)",
              color: rc.color, letterSpacing: "0.04em", lineHeight: 1,
              marginBottom: 16,
            }}>
              {result.expirationLabel}
            </p>
          ) : (
            <div style={{ position: "relative", marginBottom: 16, display: "inline-block" }}>
              {/* Blurred ghost of the date behind */}
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(36px, 8vw, 56px)",
                color: rc.color, letterSpacing: "0.04em", lineHeight: 1,
                filter: "blur(10px)", userSelect: "none", pointerEvents: "none",
                opacity: 0.7,
              }}>
                {result.expirationLabel}
              </p>
              {/* Lock overlay */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 4,
              }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11, fontWeight: 700, color: rc.color,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  background: "rgba(250,247,242,0.85)", padding: "2px 10px", borderRadius: 20,
                }}>Unlock to reveal</span>
              </div>
            </div>
          )}
          <div style={{ height: 1, background: `${rc.color}25`, margin: "0 0 16px" }} />
          <p style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 17, color: "#1A1510", lineHeight: 1.55, marginBottom: 8 }}>
            {result.headline}
          </p>
          <p style={{ fontSize: 13, color: "#5C544A", lineHeight: 1.75 }}>{result.summary}</p>
        </div>
        {/* Survival odds bar — percentage hidden until paid */}
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: rc.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Survival odds</span>
            {isPaid || isGood ? (
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: rc.color }}>{result.survivalOdds}%</span>
            ) : (
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
                color: rc.color, filter: "blur(5px)", userSelect: "none",
              }}>{result.survivalOdds}%</span>
            )}
          </div>
          <div style={{ height: 6, background: "rgba(0,0,0,0.08)", borderRadius: 3, overflow: "hidden" }}>
            {/* Bar always shows direction but exact fill blurred if not paid */}
            <div style={{
              height: "100%", background: rc.color, borderRadius: 3,
              width: isPaid || isGood ? `${result.survivalOdds}%` : "50%",
              filter: isPaid || isGood ? "none" : "blur(3px)",
              transition: "width 1.2s ease",
            }} />
          </div>
          {!isPaid && !isGood && (
            <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 6, fontStyle: "italic" }}>
              Exact odds revealed in full report
            </p>
          )}
        </div>
      </div>

      {/* PATTERN */}
      <div className="fade-up-d1" style={{ border: "1px solid var(--border)", borderRadius: 16, padding: "1.25rem 1.5rem", background: "var(--white)" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Your relationship pattern</p>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.04em", color: "var(--red)", marginBottom: 8 }}>{result.pattern}</p>
        <p style={{ fontSize: 14, color: "#5C544A", lineHeight: 1.75 }}>{result.patternDetail}</p>
      </div>

      {/* PAYWALL */}
      <div className="fade-up-d3">
        {!isPaid ? (
          <PaywallGate onUnlock={onUnlock} riskLevel={result.riskLevel} color={rc.color} />
        ) : (
          <PaidContent result={result} />
        )}
      </div>

      {/* SHARE — only available after payment */}
      {isPaid && (
        <div className="fade-up-d4">
          <ShareBtn result={result} rc={rc} />
        </div>
      )}

      <p className="fade-up-d5" style={{ fontSize: 12, color: "#C5BDB3", textAlign: "center", lineHeight: 1.6 }}>{result.disclaimer}</p>

      <button
        className="fade-up-d5"
        onClick={onRestart}
        style={{
          background: "transparent", border: "1px solid var(--border)", borderRadius: 12,
          padding: "12px 20px", fontSize: 14, color: "var(--muted)",
          width: "100%", cursor: "pointer", fontWeight: 500,
        }}
      >Start over</button>
    </div>
  );
}

function PaidContent({ result }: { result: ExpirationResult }) {
  const negFactors = result.factors.filter((f) => !f.positive);
  const posFactors = result.factors.filter((f) => f.positive);
  const urg = urgencyConfig[result.urgency] ?? urgencyConfig["watch closely"];
  const urgColor = result.urgency === "lasting" ? "#3D8B6E" : result.urgency === "act now" ? "#8B1A1A" : result.urgency === "act soon" ? "#D94F3D" : "#E8974A";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Factor breakdown */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Full breakdown</p>
        {negFactors.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, fontWeight: 500 }}>Risk factors</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {negFactors.map((f, i) => <FactorRow key={i} factor={f} />)}
            </div>
          </div>
        )}
        {posFactors.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, fontWeight: 500, marginTop: negFactors.length > 0 ? 14 : 0 }}>Protective factors</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {posFactors.map((f, i) => <FactorRow key={i} factor={f} />)}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>What to do now</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {result.whatToDoNow.map((rec, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, padding: "13px 16px",
              background: "#FAFAF8", borderRadius: 14, border: "1px solid var(--border)",
              alignItems: "flex-start",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", background: "var(--ink)",
                color: "#fff", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1, fontFamily: "'Bebas Neue', sans-serif", fontSize: 14,
              }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{rec.title}</p>
                <p style={{ fontSize: 13, color: "#5C544A", lineHeight: 1.65 }}>{rec.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px", background: "#F8F5F2",
        borderRadius: 12, border: `1px solid ${urgColor}30`,
      }}>
        <span style={{
          width: 30, height: 30, borderRadius: "50%",
          background: urgColor, color: "#fff", fontSize: 12, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{urg.icon}</span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: urgColor, textTransform: "capitalize" }}>Verdict: {urg.label}</p>
          <p style={{ fontSize: 12, color: "#5C544A", marginTop: 3, lineHeight: 1.55 }}>
            {result.urgency === "lasting" ? "Your relationship shows genuine resilience. Invest in what's working." :
             result.urgency === "watch closely" ? "No crisis — but the trajectory needs attention. Small shifts now prevent bigger problems." :
             result.urgency === "act soon" ? "These patterns compound. Addressing them now is significantly easier than addressing them in a year." :
             "One or more serious patterns are accelerating. Professional support tends to be the most effective move at this stage."}
          </p>
        </div>
      </div>
    </div>
  );
}

function FactorRow({ factor }: { factor: ExpirationResult["factors"][0] }) {
  const isPos = factor.positive;
  const wColor = factor.weight === "critical" ? "#8B1A1A" : factor.weight === "significant" ? "#D94F3D" : "#E8974A";
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 14px", background: "var(--white)",
      borderRadius: 12, border: `1px solid ${isPos ? "#A8D4C2" : "#F4B5AE"}`,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: isPos ? "#3D8B6E" : "#D94F3D", marginTop: 5, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{factor.label}</span>
          {!isPos && factor.weight !== "moderate" && (
            <span style={{ fontSize: 10, fontWeight: 600, color: wColor, background: `${wColor}15`, padding: "2px 8px", borderRadius: 20 }}>
              {factor.weight === "critical" ? "Critical" : "Significant"}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: "#5C544A", lineHeight: 1.55 }}>{factor.detail}</p>
      </div>
    </div>
  );
}

function PaywallGate({ onUnlock, riskLevel, color }: { onUnlock: () => void; riskLevel: string; color: string }) {
  const [loading, setLoading] = useState(false);
  const locked = ["Your exact expiration date — revealed in full", "Your survival odds percentage", "Complete factor breakdown (what's actually driving it)", "3 specific action steps", "Shareable result card — send it, post it, confront your partner with it"];
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{ filter: "blur(4px)", pointerEvents: "none", padding: "1.25rem 1.5rem", background: "#FAFAF8", userSelect: "none" }}>
        {[1,2,3].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "11px 14px", background: "var(--white)", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: i % 2 === 0 ? "#3D8B6E" : "#D94F3D", marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 11, background: "#E8E2D9", borderRadius: 4, marginBottom: 7, width: "40%" }} />
              <div style={{ height: 9, background: "#F0EDE9", borderRadius: 4, width: "80%" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", marginTop: -40, height: 40, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.98))" }} />
      <div style={{ background: "var(--white)", padding: "1.5rem", borderTop: "1px solid #F5F2EE" }}>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.04em", color: "var(--ink)", textAlign: "center", marginBottom: 6 }}>
          UNLOCK THE FULL BREAKDOWN
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", marginBottom: "1.25rem", lineHeight: 1.65 }}>
          The date is calculated. Unlock to see it — along with every factor driving the prediction and your exact survival odds.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: "1.25rem" }}>
          {locked.map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#4A4440" }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--green-light)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
              {item}
            </div>
          ))}
        </div>
        <button
          onClick={() => { setLoading(true); onUnlock(); }}
          disabled={loading}
          style={{
            width: "100%", background: loading ? "#E8D5D3" : "var(--red)",
            color: "#fff", border: "none", borderRadius: 14,
            padding: "15px 20px", cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.06em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.15s",
          }}
        >
          {loading
            ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />OPENING CHECKOUT…</>
            : "UNLOCK FULL REPORT — $4.99"
          }
        </button>
        <p style={{ fontSize: 11, color: "#C5BDB3", textAlign: "center", marginTop: 10 }}>One-time payment · Secure checkout via Stripe</p>
      </div>
    </div>
  );
}

function ShareBtn({ result, rc }: { result: ExpirationResult; rc: typeof riskConfig["Strong"] }) {
  const [status, setStatus] = useState<"idle" | "generating" | "copied" | "shared">("idle");

  function drawCard(): HTMLCanvasElement {
    const W = 1080, H = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    // Background
    ctx.fillStyle = "#FAF7F2"; ctx.fillRect(0, 0, W, H);
    // Dark top bar
    ctx.fillStyle = "#1A1510";
    ctx.beginPath(); ctx.roundRect(60, 60, W-120, 100, 16); ctx.fill();
    ctx.fillStyle = rc.color;
    ctx.font = "bold 14px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("EXPIRATION DATE REPORT", 90, 120);
    ctx.fillStyle = "#fff"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "right";
    ctx.fillText(result.riskLevel.toUpperCase(), W-90, 120);
    // Main card
    ctx.fillStyle = rc.bg;
    ctx.beginPath(); ctx.roundRect(60, 180, W-120, 340, 16); ctx.fill();
    ctx.strokeStyle = rc.border; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(60, 180, W-120, 340, 16); ctx.stroke();
    // Label
    ctx.fillStyle = rc.color; ctx.font = "600 22px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("PREDICTED END DATE", W/2, 240);
    // Date
    ctx.fillStyle = rc.color; ctx.font = `bold 64px sans-serif`;
    ctx.fillText(result.expirationLabel, W/2, 330);
    // Survival odds
    ctx.fillStyle = "#5C544A"; ctx.font = "400 28px sans-serif";
    ctx.fillText(`Survival odds: ${result.survivalOdds}%`, W/2, 390);
    // Divider
    ctx.strokeStyle = `${rc.color}25`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(120, 420); ctx.lineTo(W-120, 420); ctx.stroke();
    // Headline
    ctx.fillStyle = "#1A1510"; ctx.font = "italic 500 34px Georgia, serif"; ctx.textAlign = "center";
    wrapText(ctx, result.headline, W/2, 470, W-240, 46, 3);
    // Pattern
    ctx.fillStyle = "#1A1510"; ctx.font = "bold 22px sans-serif";
    ctx.fillText(result.pattern, W/2, 570);
    // Threat + Strength boxes
    const boxY = 610, boxH = 160, boxW = (W-160)/2;
    ctx.fillStyle = "#FAEAE8"; ctx.beginPath(); ctx.roundRect(80, boxY, boxW, boxH, 12); ctx.fill();
    ctx.fillStyle = "#D94F3D"; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("BIGGEST THREAT", 104, boxY+36);
    ctx.fillStyle = "#6B1A12"; ctx.font = "500 22px sans-serif";
    wrapText(ctx, result.biggestThreat, 104, boxY+72, boxW-48, 32, 2);
    const b2x = 80 + boxW + 40;
    ctx.fillStyle = "#E4F2EC"; ctx.beginPath(); ctx.roundRect(b2x, boxY, boxW, boxH, 12); ctx.fill();
    ctx.fillStyle = "#2A6B53"; ctx.font = "bold 18px sans-serif";
    ctx.fillText("BIGGEST STRENGTH", b2x+24, boxY+36);
    ctx.fillStyle = "#1A4435"; ctx.font = "500 22px sans-serif";
    wrapText(ctx, result.biggestStrength, b2x+24, boxY+72, boxW-48, 32, 2);
    // Footer
    ctx.fillStyle = "#8A8278"; ctx.font = "400 24px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("expirationdate.app · Find yours.", W/2, H-60);
    return canvas;
  }

  async function handleShare() {
    setStatus("generating");
    await new Promise((r) => setTimeout(r, 50));
    const canvas = drawCard();
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
    const file = new File([blob], "my-expiration-date.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "My Relationship Expiration Date", text: `The algorithm says: ${result.expirationLabel}. ${result.headline} Find yours at expirationdate.app` });
        setStatus("shared"); setTimeout(() => setStatus("idle"), 2500); return;
      } catch {}
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "my-expiration-date.png"; a.click();
    URL.revokeObjectURL(url);
    try { await navigator.clipboard.writeText(window.location.href); setStatus("copied"); } catch { setStatus("idle"); }
    setTimeout(() => setStatus("idle"), 2500);
  }

  const label = status === "generating" ? "Generating card…" : status === "copied" ? "Image saved · Link copied!" : status === "shared" ? "Shared!" : "Share my expiration date";
  const btnBg = status === "idle" ? "var(--ink)" : status === "generating" ? "#5C544A" : "#3D8B6E";

  return (
    <button onClick={handleShare} disabled={status === "generating"} style={{
      width: "100%", background: btnBg, color: "#fff", border: "none",
      borderRadius: 14, padding: "14px 20px",
      fontFamily: status === "idle" ? "'Bebas Neue', sans-serif" : "DM Sans, sans-serif",
      fontSize: status === "idle" ? 18 : 15, letterSpacing: status === "idle" ? "0.06em" : "0",
      cursor: status === "generating" ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "background 0.2s",
    }}>
      {status === "generating"
        ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />{label}</>
        : label
      }
    </button>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 3) {
  const words = text.split(" "); let line = "", lineCount = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, y + lineCount * lineHeight); line = words[i] + " "; lineCount++;
      if (lineCount >= maxLines) { ctx.fillText(line.trim() + "…", x, y + lineCount * lineHeight); return; }
    } else { line = test; }
  }
  ctx.fillText(line.trim(), x, y + lineCount * lineHeight);
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
