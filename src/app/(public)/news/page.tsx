import type { Metadata } from "next";

import { NewsCard } from "@/components/public/cards";
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
  const posts = await newsService.listPublished();
  return (
    <>
      <PageHero eyebrow={pageIntros.news.eyebrow} title={pageIntros.news.title} description={pageIntros.news.description} />
      <section className="section-pad">
        <div className="container-wide">
          <h2 className="sr-only">All news</h2>
          {posts.length ? (
            <ul className="card-grid">
              {posts.map((post) => (
                <li key={post.id}>
                  <NewsCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote>News will appear here once it is published.</EmptyNote>
          )}
        </div>
      </section>
    </>
  );
}
