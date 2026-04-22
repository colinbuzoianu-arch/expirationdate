export type Answers = Record<string, string | number>;

export interface ExpirationResult {
  monthsRemaining: number | null; // null = "indefinite / strong"
  expirationLabel: string; // e.g. "June 2026" or "No expiration detected"
  survivalOdds: number; // 0-100, higher = more likely to last
  riskLevel: "Strong" | "Fragile" | "Critical" | "Terminal";
  headline: string;
  summary: string;
  pattern: string;
  patternDetail: string;
  biggestThreat: string;
  biggestThreatDetail: string;
  biggestStrength: string;
  biggestStrengthDetail: string;
  factors: {
    label: string;
    detail: string;
    positive: boolean;
    weight: "critical" | "significant" | "moderate";
  }[];
  whatToDoNow: {
    title: string;
    detail: string;
  }[];
  urgency: "lasting" | "watch closely" | "act soon" | "act now";
  disclaimer: string;
}
