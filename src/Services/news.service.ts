import type { Actor } from "@/lib/auth/auth-guard";
import { newsPostRepository, type NewsPostRecord } from "@/Repositories/news-post.repository";
import type { NewsCreateInput } from "@/Schemas/news.schema";
import {
  createContentService,
  mediaProblem,
  problems,
  toContentDtoBase,
  type ContentDtoBase,
} from "@/Services/content.service";

export type NewsPostDto = ContentDtoBase & {
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  coverImagePublicId: string | null;
  tags: string[];
  authorId: string | null;
  author: { id: string; name: string } | null;
};

export function toNewsPostDto(record: NewsPostRecord): NewsPostDto {
  return {
    ...toContentDtoBase(record),
    title: record.title,
    excerpt: record.excerpt,
    body: record.body,
    coverImageUrl: record.coverImageUrl,
    coverImagePublicId: record.coverImagePublicId,
    tags: record.tags,
    authorId: record.authorId,
    author: record.author,
  };
}

const base = createContentService({
  module: "news",
  entityType: "news_post",
  label: "News post",
  repository: newsPostRepository,
  toDto: toNewsPostDto,
  titleOf: (record) => record.title,
  slugSource: (input) => input.title,
  publishProblems: (record) => problems(mediaProblem(record.coverImageUrl, "A cover image")),
});

export const newsService = {
  ...base,
  /** The author defaults to whoever creates the post. */
  create(input: NewsCreateInput, actor: Actor) {
    return base.create({ ...input, authorId: input.authorId === undefined ? actor.id : input.authorId }, actor);
  },
};
