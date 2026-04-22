export type QuestionType = "options" | "range" | "textarea";

export interface Question {
  id: string;
  label: string;
  sub?: string;
  type: QuestionType;
  options?: string[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  default?: number;
}

export interface Step {
  title: string;
  questions: Question[];
}

export const steps: Step[] = [
  {
    title: "The basics",
    questions: [
      {
        id: "duration",
        label: "How long have you been together?",
        type: "options",
        options: ["Less than 6 months", "6 months – 2 years", "2–5 years", "5–10 years", "Over 10 years"],
      },
      {
        id: "conflict_freq",
        label: "How often do you have real arguments — not just small irritations?",
        sub: "Be honest. 'Never' is rarely accurate.",
        type: "options",
        options: ["Rarely, maybe a few times a year", "Monthly", "Weekly", "Multiple times a week", "Almost daily"],
      },
    ],
  },
  {
    title: "Intimacy & connection",
    questions: [
      {
        id: "intimacy_trend",
        label: "How has your emotional closeness changed over the past year?",
        sub: "Not physical — emotional. The feeling of being truly known.",
        type: "options",
        options: [
          "Noticeably stronger than a year ago",
          "About the same — stable and good",
          "About the same — but it was already distant",
          "Slowly drifting apart",
          "Significantly colder than a year ago",
        ],
      },
      {
        id: "physical_intimacy",
        label: "How satisfied are you with physical intimacy in the relationship?",
        type: "range",
        min: 1,
        max: 10,
        minLabel: "Completely unsatisfied",
        maxLabel: "Very satisfied",
        default: 6,
      },
    ],
  },
  {
    title: "Goals & future",
    questions: [
      {
        id: "goal_alignment",
        label: "When you imagine your life 5 years from now, does your partner fit in naturally?",
        sub: "Not 'do you love them' — does the life you want include them?",
        type: "options",
        options: [
          "Absolutely — I can't picture it without them",
          "Yes, mostly",
          "I'm honestly not sure",
          "There are some real mismatches",
          "I'm starting to think we want different things",
        ],
      },
      {
        id: "deal_breakers",
        label: "Are there unresolved deal-breakers between you?",
        sub: "Kids, location, lifestyle, values — things neither of you will compromise on.",
        type: "options",
        options: [
          "No, we're aligned on the big things",
          "Minor differences we're working through",
          "One significant unresolved issue",
          "Multiple significant tensions",
          "Yes — and we're both aware it's a problem",
        ],
      },
    ],
  },
  {
    title: "The hard stuff",
    questions: [
      {
        id: "contempt",
        label: "Does either of you ever feel genuine contempt for the other?",
        sub: "Contempt is different from frustration. It's a sense that your partner is inferior or ridiculous. It's the single most accurate predictor of a breakup.",
        type: "options",
        options: [
          "No — we respect each other deeply",
          "Occasionally in the heat of the moment, but it passes",
          "Sometimes, and I'm not sure it fully passes",
          "Yes, I've felt it more than I'm comfortable admitting",
          "Yes, regularly — on one or both sides",
        ],
      },
      {
        id: "repair",
        label: "After a fight, what actually happens?",
        sub: "How you recover matters more than how often you fight.",
        type: "options",
        options: [
          "We reconnect quickly and genuinely",
          "We cool off and move on without fully resolving it",
          "It takes days to feel normal again",
          "We often reach a truce but the issue stays buried",
          "We rarely fully recover — things accumulate",
        ],
      },
    ],
  },
  {
    title: "Gut feeling",
    questions: [
      {
        id: "gut",
        label: "Deep down — not what you wish — what does your gut say about where this is heading?",
        sub: "Your instincts have data your conscious mind doesn't. Answer this one last.",
        type: "options",
        options: [
          "We're going to be okay — I feel it",
          "I'm cautiously optimistic but there's work to do",
          "I genuinely don't know",
          "Something feels off and has for a while",
          "I think this has an expiration date",
        ],
      },
      {
        id: "extra",
        label: "Anything specific you want the algorithm to know?",
        sub: "Optional. A recent event, a pattern, something you can't say out loud — add it here. It sharpens the result.",
        type: "textarea",
      },
    ],
  },
];
