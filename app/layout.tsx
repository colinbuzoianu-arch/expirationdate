import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expiration Date — Does Your Relationship Have One?",
  description: "Answer 10 honest questions. Our AI predicts the literal date your relationship ends. Morbid. Controversial. Shockingly accurate.",
  openGraph: {
    title: "Expiration Date — Does Your Relationship Have One?",
    description: "Our app says we have 14 months left. Find out yours.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
