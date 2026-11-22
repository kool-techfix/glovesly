import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MediaImage } from "@/components/public/media-image";
import { Paragraphs } from "@/components/public/prose";
import { PageHero } from "@/components/site";
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
      <PageHero
        variant="article"
        breadcrumbs={[{ label: "News", href: "/news" }, { label: post.title }]}
        eyebrow={post.tags.length ? post.tags.join(" · ") : undefined}
        title={post.title}
        facts={[
          {
            label: "Published",
            value: post.publishedAt ? <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time> : null,
          },
          { label: "Source", value: post.sourceName ? `Source: ${post.sourceName}` : null },
        ]}
      />
      <div className="section-pad">
        <div className="container-narrow">
          {post.coverImageUrl ? (
            <figure className="mb-10">
              <MediaImage src={post.coverImageUrl} alt="" sizes="(max-width: 860px) 100vw, 820px" priority className="aspect-[16/9]" />
            </figure>
          ) : null}
          {post.excerpt ? <p className="lede prose-measure news-body mb-8">{post.excerpt}</p> : null}
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
