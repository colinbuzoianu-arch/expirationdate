import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relationship Insights | CoupleIQ Blog",
  description:
    "Evidence-based articles on relationships, the Gottman Method, attachment theory, conflict patterns, and more.",
  alternates: {
    canonical: "https://splitornot.com/blog",
  },
  openGraph: {
    title: "Relationship Insights | CoupleIQ Blog",
    description: "Evidence-based articles to help you understand your relationship.",
    url: "https://splitornot.com/blog",
    siteName: "CoupleIQ",
    type: "website",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

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
          <Link href="/" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>← Back to analyzer</Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a1a", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
            Relationship insights
          </h1>
          <p style={{ fontSize: 15, color: "#777", lineHeight: 1.6 }}>
            Evidence-based articles to help you understand your relationship.
          </p>
        </div>

        {/* Post list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #efefed", padding: "1.5rem", cursor: "pointer", transition: "border-color 0.15s" }}>
                <p style={{ fontSize: 12, color: "#bbb", marginBottom: "0.4rem", fontWeight: 500 }}>
                  {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: "0.5rem", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65 }}>{post.description}</p>
                <p style={{ fontSize: 13, color: "#534ab7", marginTop: "0.75rem", fontWeight: 600 }}>Read article →</p>
              </div>
            </Link>
          ))}
        </div>

        <p style={{ marginTop: "2rem", fontSize: 12, color: "#ccc", textAlign: "center" }}>
          CoupleIQ · Built on relationship science · Powered by Claude AI
        </p>
      </div>
    </main>
  );
}
