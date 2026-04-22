import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";
import { Answers, ExpirationResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Add ANTHROPIC_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const answers: Answers = body.answers;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const prompt = buildPrompt(answers);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return NextResponse.json(
        { error: `Analysis service error (${anthropicRes.status}). Please try again.` },
        { status: 502 }
      );
    }

    const data = await anthropicRes.json();

    if (data.type === "error") {
      return NextResponse.json(
        { error: data.error?.message ?? "Analysis service returned an error." },
        { status: 502 }
      );
    }

    const rawText: string = data.content
      .map((block: { type: string; text?: string }) => (block.type === "text" ? block.text ?? "" : ""))
      .join("");

    const clean = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let result: ExpirationResult;
    try {
      result = JSON.parse(clean);
    } catch {
      console.error("JSON parse failed. Raw text:", rawText.slice(0, 800));
      return NextResponse.json(
        { error: "Could not parse the analysis. Please try again." },
        { status: 500 }
      );
    }

    if (
      typeof result.survivalOdds !== "number" ||
      !result.riskLevel ||
      !result.headline ||
      !result.summary ||
      !Array.isArray(result.factors)
    ) {
      return NextResponse.json(
        { error: "Analysis was incomplete. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Unhandled route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
