"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const token = searchParams.get("token");

    if (!sessionId || !token) {
      setStatus("error");
      return;
    }

    fetch(`/api/verify-payment?session_id=${sessionId}&token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          // Mark as paid in localStorage so the main page can read it
          localStorage.setItem(`paid_${token}`, "true");
          setStatus("redirecting");
          // Redirect back to main page with the token
          window.location.href = `/?unlocked=${token}`;
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#FAF7F2",
      fontFamily: "DM Sans, sans-serif", padding: "2rem",
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        {status === "loading" && (
          <>
            <div style={{
              width: 48, height: 48, border: "3px solid #FAEAE8",
              borderTopColor: "#D94F3D", borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 1.5rem",
            }} />
            <p style={{ fontSize: 16, color: "#8A8278" }}>Verifying your payment…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}
        {status === "redirecting" && (
          <>
            <div style={{ fontSize: 40, marginBottom: "1rem" }}>✓</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#1A1510", marginBottom: 8 }}>Payment confirmed!</p>
            <p style={{ fontSize: 14, color: "#8A8278" }}>Returning to your results…</p>
          </>
        )}
        {status === "error" && (
          <>
            <p style={{ fontSize: 16, color: "#D94F3D", marginBottom: "1rem" }}>
              Something went wrong verifying your payment.
            </p>
            <p style={{ fontSize: 13, color: "#8A8278", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              If you were charged, please email us at{" "}
              <a href="mailto:support.coupleiq@gmail.com" style={{ color: "#D94F3D" }}>
                support.coupleiq@gmail.com
              </a>{" "}
              and we'll sort it out immediately.
            </p>
            <a href="/" style={{
              display: "inline-block", background: "#D94F3D", color: "#fff",
              borderRadius: 10, padding: "12px 24px", textDecoration: "none",
              fontSize: 14, fontWeight: 600,
            }}>← Back to home</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function Success() {
  return <Suspense><SuccessInner /></Suspense>;
}
