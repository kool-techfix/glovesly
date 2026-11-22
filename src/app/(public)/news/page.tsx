import type { Metadata } from "next";

import { FeaturedNewsCard, NewsCard } from "@/components/public/cards";
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
      {latest ? (
        <section className="section-pad pb-0" aria-labelledby="news-latest-title">
          <div className="container-wide">
            <h2 id="news-latest-title" className="sr-only">
              Latest news
            </h2>
            <FeaturedNewsCard post={latest} />
          </div>
        </section>
      ) : null}
      <section className="section-pad">
        <div className="container-wide">
          {rest.length ? (
            <>
              <h2 className="sr-only">More news</h2>
              <ul className="card-grid">
                {rest.map((post) => (
                  <li key={post.id}>
                    <NewsCard post={post} />
                  </li>
                ))}
              </ul>
            </>
          ) : latest ? null : (
            <EmptyNote>News will appear here once it is published.</EmptyNote>
          )}
        </div>
      </section>
    </>
  );
}
