import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaImage } from "@/components/public/media-image";
import { Paragraphs } from "@/components/public/prose";
import { Eyebrow } from "@/components/site";
import { excerpt, formatLongDate } from "@/lib/display";
import { newsService } from "@/Services/news.service";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await newsService.listPublished()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await newsService.getPublishedBySlug((await params).slug);
  if (!post) return { title: "Article not found" };
  // Only our own cover image is ever used; never the outlet's picture.
  return {
    title: post.title,
    description: excerpt(post.excerpt || post.body),
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const post = await newsService.getPublishedBySlug((await params).slug);
  if (!post) notFound();

  return (
    <article>
      <header className="page-hero">
        <div className="container-narrow relative z-10">
          <Link href="/news" className="link-arrow focus-ring" data-testid="link-news-back">
            <ArrowLeft aria-hidden="true" size={16} /> All news
          </Link>
          <Eyebrow className="mt-8">
            {post.publishedAt ? <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time> : "News"}
          </Eyebrow>
          <h1 className="display page-hero-title">{post.title}</h1>
          {post.excerpt ? <p className="lede page-hero-description">{post.excerpt}</p> : null}
          {post.author ? <p className="mt-6 text-sm text-muted-foreground">By {post.author.name}</p> : null}
        </div>
      </header>
      <div className="section-pad">
        <div className="container-narrow">
          {post.coverImageUrl ? (
            <MediaImage src={post.coverImageUrl} alt="" sizes="(max-width: 860px) 100vw, 800px" priority className="aspect-[16/9] mb-10" />
          ) : null}
          {/* Plain paragraphs split on blank lines; no markdown is interpreted. */}
          <Paragraphs text={post.body} className="prose-measure news-body" />
          {post.tags.length ? (
            <ul className="tag-list mt-10" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
          {post.sourceUrl && post.sourceName ? (
            <p className="news-source prose-measure news-body">
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow focus-ring"
                data-testid="link-news-source"
              >
                Read the original report on {post.sourceName}
                <span className="sr-only"> (opens in a new tab)</span>
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
