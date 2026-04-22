import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { remark } from "remark";
import html from "remark-html";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = getPostBySlug(params.slug);
    return {
      title: `${post.title} | CoupleIQ`,
      description: post.description,
      alternates: { canonical: `https://splitornot.com/blog/${params.slug}` },
      openGraph: {
        title: post.title,
        description: post.description,
        url: `https://splitornot.com/blog/${params.slug}`,
        siteName: "CoupleIQ",
        type: "article",
        images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
      },
    };
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  let post;
  try {
    post = getPostBySlug(params.slug);
  } catch {
    notFound();
  }

  const processedContent = await remark().use(html).process(post.content);
  const contentHtml = processedContent.toString();

  return (
    <main style={{ background: "#f0efed", minHeight: "100vh", padding: "2rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 680 }}>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/logo.png" alt="CoupleIQ" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
              Couple<span style={{ color: "#534ab7" }}>IQ</span>
            </span>
          </Link>
          <Link href="/blog" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>← All articles</Link>
        </div>

        {/* Article */}
        <article style={{ background: "#fff", borderRadius: 16, border: "1px solid #efefed", padding: "2.5rem 2rem" }}>
          <p style={{ fontSize: 12, color: "#bbb", marginBottom: "0.75rem", fontWeight: 500 }}>
            {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
            {post.title}
          </h1>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, marginBottom: "2rem", borderBottom: "1px solid #f5f5f3", paddingBottom: "1.5rem" }}>
            {post.description}
          </p>
          <div className="prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>

        {/* CTA */}
        <div style={{ background: "#534ab7", borderRadius: 16, padding: "2rem", marginTop: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>
            Wondering about your own relationship?
          </p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Take CoupleIQ's 5-minute evidence-based assessment. Free to start.
          </p>
          <Link
            href="/"
            style={{ background: "#fff", color: "#534ab7", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block", letterSpacing: "0.01em" }}
          >
            Get my relationship score →
          </Link>
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: 12, color: "#ccc", textAlign: "center" }}>
          CoupleIQ · Built on relationship science · Powered by Claude AI
        </p>
      </div>
    </main>
  );
}
