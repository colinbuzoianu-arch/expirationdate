export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const token = searchParams.get("token");

    if (!sessionId || !token) {
      return NextResponse.json({ success: false, error: "Missing parameters." }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ success: false, error: "Payment not configured." }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: "Payment not confirmed." });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ success: false, error: "Verification failed." }, { status: 500 });
  }
}
