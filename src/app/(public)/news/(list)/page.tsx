import type { Metadata } from "next";

import { NewsFeature, NewsRows } from "@/components/public/news-list";
import { EmptyNote } from "@/components/public/sections";
import { PageHero } from "@/components/site";
import { pageIntros } from "@/data/content";
import { newsService } from "@/Services/news.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "News",
  description: pageIntros.news.description,
};

export default async function NewsPage() {
  const posts = await newsService.listPublished(); // newest first
  const [latest, ...rest] = posts;
  return (
    <>
      <PageHero variant="compact" title={pageIntros.news.title} description={pageIntros.news.description} />
      <section className="section-pad" aria-label="News">
        <div className="container-wide">
          {latest ? <NewsFeature post={latest} /> : null}
          {rest.length ? (
            <div className="news-more">
              <h2 className="sr-only">More news</h2>
              <NewsRows posts={rest} />
            </div>
          ) : null}
          {!latest ? <EmptyNote>News will appear here once it is published.</EmptyNote> : null}
        </div>
      </section>
    </>
  );
}
