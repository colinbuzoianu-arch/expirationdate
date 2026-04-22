"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const token = searchParams.get("token");
    if (!sessionId || !token) { setStatus("error"); return; }
    fetch(`/api/verify-payment?session_id=${sessionId}&token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem(`paid_${token}`, "true");
          window.location.href = `/?unlocked=${token}`;
        } else { setStatus("error"); }
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF7F2", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        {status === "loading" && <p style={{ fontSize: 16, color: "#8A8278" }}>Verifying your payment…</p>}
        {status === "error" && <p style={{ fontSize: 16, color: "#D94F3D" }}>Something went wrong. Please email us for support.</p>}
      </div>
    </div>
  );
}

export default function Success() {
  return <Suspense><SuccessInner /></Suspense>;
}
