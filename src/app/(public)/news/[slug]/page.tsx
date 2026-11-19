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
            ← All news
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
          <MediaImage
            src={post.coverImageUrl}
            alt=""
            label={post.title.charAt(0)}
            sizes="(max-width: 860px) 100vw, 800px"
            priority
            className="aspect-[16/9] rounded-[var(--radius)]"
          />
          <Paragraphs text={post.body} className="mt-10" />
          {post.tags.length ? (
            <ul className="tag-list mt-10" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}
