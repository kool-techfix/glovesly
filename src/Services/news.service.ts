import type { Actor } from "@/lib/auth/auth-guard";
import { newsPostRepository, type NewsPostRecord } from "@/Repositories/news-post.repository";
import { ApiError } from "@/lib/api/api-error";
import {
  missingSourceField,
  SOURCE_PAIR_MESSAGES,
  type NewsCreateInput,
  type NewsUpdateInput,
} from "@/Schemas/news.schema";
import {
  createContentService,
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
  /** Outlet that first reported the story; set together with sourceUrl. */
  sourceName: string | null;
  sourceUrl: string | null;
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
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
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
  // The cover image is optional: only Glovesly's own photos, uploaded in the admin.
  publishProblems: (record) =>
    problems(
      !record.title.trim() && "Add a title.",
      !record.excerpt.trim() && "Add an excerpt.",
      !record.body.trim() && "Add the article body.",
    ),
});

export const newsService = {
  ...base,
  /** The author defaults to whoever creates the post. */
  create(input: NewsCreateInput, actor: Actor) {
    return base.create({ ...input, authorId: input.authorId === undefined ? actor.id : input.authorId }, actor);
  },
  /**
   * An update that sends only one of sourceName/sourceUrl is checked against
   * the stored row, so the pair can never end up half set.
   */
  async update(id: string, input: NewsUpdateInput, actor: Actor) {
    if (("sourceName" in input) !== ("sourceUrl" in input)) {
      const existing = await newsPostRepository.findById(id);
      if (existing) {
        const missing = missingSourceField({
          sourceName: "sourceName" in input ? input.sourceName : existing.sourceName,
          sourceUrl: "sourceUrl" in input ? input.sourceUrl : existing.sourceUrl,
        });
        if (missing) throw ApiError.validation("Some fields are invalid.", { [missing]: SOURCE_PAIR_MESSAGES[missing] });
      }
    }
    return base.update(id, input, actor);
  },
};
