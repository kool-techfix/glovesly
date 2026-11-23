import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CloudinaryImage } from "@/components/cloudinary-image";
import { formatLongDate } from "@/lib/display";
import { cn } from "@/lib/utils";
import type { NewsPostDto } from "@/Services/news.service";

/*
 * Text-first news. A post shows an image only when one of Glovesly's own
 * photos has been uploaded in the admin; otherwise there is no image area at
 * all (no tile, no placeholder, no gap). Images are never taken from outlets.
 *
 * The title link covers the whole row (::after), so the row is one target;
 * "Read article" is its visual cue.
 */

function Meta({ post }: { post: NewsPostDto }) {
  if (!post.publishedAt && !post.sourceName) return null;
  return (
    <p className="news-meta">
      {post.publishedAt ? <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time> : null}
      {post.publishedAt && post.sourceName ? <span aria-hidden="true">·</span> : null}
      {post.sourceName ? <span>Source: {post.sourceName}</span> : null}
    </p>
  );
}

/** One row in the news list. Thumbnail (4:3) on the right on desktop, above the text on mobile, only when there is an image. */
export function NewsRow({ post, headingLevel = "h3" }: { post: NewsPostDto; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className={cn("news-row", post.coverImageUrl && "has-image")} data-testid={`row-news-${post.slug}`}>
      <div className="news-row-text">
        <Meta post={post} />
        <Heading className="news-row-title">
          <Link href={`/news/${post.slug}`} className="news-row-link focus-ring" data-testid={`link-news-row-${post.slug}`}>
            {post.title}
          </Link>
        </Heading>
        {post.excerpt ? <p className="news-row-excerpt">{post.excerpt}</p> : null}
        <span className="news-read" aria-hidden="true">
          Read article <ArrowRight size={16} />
        </span>
      </div>
      {post.coverImageUrl ? (
        <div className="news-row-thumb">
          <CloudinaryImage src={post.coverImageUrl} alt="" fill sizes="(max-width: 720px) 100vw, 220px" className="object-cover" />
        </div>
      ) : null}
    </article>
  );
}

/** The latest article, larger. Two columns (text, image) with an image; one wide text block without. */
export function NewsFeature({ post }: { post: NewsPostDto }) {
  return (
    <article className={cn("news-feature", post.coverImageUrl && "has-image")} data-testid={`feature-news-${post.slug}`}>
      <div className="news-feature-text">
        <p className="eyebrow">Latest</p>
        <Meta post={post} />
        <h2 className="display news-feature-title">
          <Link href={`/news/${post.slug}`} className="news-row-link focus-ring" data-testid={`link-news-featured-${post.slug}`}>
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="news-feature-excerpt">{post.excerpt}</p> : null}
        <span className="news-read" aria-hidden="true">
          Read article <ArrowRight size={16} />
        </span>
      </div>
      {post.coverImageUrl ? (
        <div className="news-feature-media">
          <CloudinaryImage src={post.coverImageUrl} alt="" fill sizes="(max-width: 900px) 100vw, 45vw" preload className="object-cover" />
        </div>
      ) : null}
    </article>
  );
}

/** A list of rows separated by hairlines. */
export function NewsRows({ posts, headingLevel }: { posts: NewsPostDto[]; headingLevel?: "h2" | "h3" }) {
  return (
    <ul className="news-rows">
      {posts.map((post) => (
        <li key={post.id}>
          <NewsRow post={post} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
