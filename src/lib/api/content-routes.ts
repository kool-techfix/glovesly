import type { ZodType, ZodTypeDef } from "zod";

import { ApiError } from "@/lib/api/api-error";
import { parseJson, parseParams, parseQuery } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import {
  idParamsSchema,
  listQuerySchema,
  slugParamsSchema,
  statusChangeSchema,
} from "@/Schemas/common.schema";
import type { ContentServiceApi } from "@/Services/content.service";

/*
 * Route handler factories shared by every content module, so each route.ts
 * is three lines, e.g.
 *   export const { GET, POST } = adminCollectionRoutes(projectService, projectCreateSchema);
 */

type Schema<T> = ZodType<T, ZodTypeDef, unknown>;
type IdContext = { params: Promise<{ id: string }> };
type SlugContext = { params: Promise<{ slug: string }> };

/** GET (paged list: ?search=&status=&page=&pageSize=) and POST (create) for /api/admin/{module}. EDITOR+. */
export function adminCollectionRoutes<TCreate, TUpdate, TDto>(
  service: ContentServiceApi<TCreate, TUpdate, TDto>,
  createSchema: Schema<TCreate>,
) {
  return {
    GET: (request: Request) =>
      handle(async () => {
        await requireEditor();
        const query = parseQuery(request, listQuerySchema);
        const { items, meta } = await service.list(query);
        return ok(items, { meta });
      }),

    POST: (request: Request) =>
      handle(async () => {
        const actor = await requireEditor();
        const input = await parseJson(request, createSchema);
        return ok(await service.create(input, actor), { status: 201 });
      }),
  };
}

/** GET, PATCH and DELETE for /api/admin/{module}/[id]. EDITOR+. */
export function adminItemRoutes<TCreate, TUpdate, TDto>(
  service: ContentServiceApi<TCreate, TUpdate, TDto>,
  updateSchema: Schema<TUpdate>,
) {
  return {
    GET: (_request: Request, context: IdContext) =>
      handle(async () => {
        await requireEditor();
        const { id } = parseParams(await context.params, idParamsSchema);
        return ok(await service.getById(id));
      }),

    PATCH: (request: Request, context: IdContext) =>
      handle(async () => {
        const actor = await requireEditor();
        const { id } = parseParams(await context.params, idParamsSchema);
        const input = await parseJson(request, updateSchema);
        return ok(await service.update(id, input, actor));
      }),

    DELETE: (_request: Request, context: IdContext) =>
      handle(async () => {
        const actor = await requireEditor();
        const { id } = parseParams(await context.params, idParamsSchema);
        return ok(await service.remove(id, actor));
      }),
  };
}

/** POST { status } for /api/admin/{module}/[id]/status. EDITOR+. */
export function adminStatusRoute<TCreate, TUpdate, TDto>(service: ContentServiceApi<TCreate, TUpdate, TDto>) {
  return {
    POST: (request: Request, context: IdContext) =>
      handle(async () => {
        const actor = await requireEditor();
        const { id } = parseParams(await context.params, idParamsSchema);
        const { status } = await parseJson(request, statusChangeSchema);
        return ok(await service.setStatus(id, status, actor));
      }),
  };
}

/** GET /api/public/{module}: PUBLISHED items only, no auth. */
export function publicListRoute<TCreate, TUpdate, TDto>(service: ContentServiceApi<TCreate, TUpdate, TDto>) {
  return {
    GET: () => handle(async () => ok(await service.listPublished())),
  };
}

/** GET /api/public/{module}/[slug]: 404 if missing or unpublished. */
export function publicSlugRoute<TCreate, TUpdate, TDto>(service: ContentServiceApi<TCreate, TUpdate, TDto>) {
  return {
    GET: (_request: Request, context: SlugContext) =>
      handle(async () => {
        const { slug } = parseParams(await context.params, slugParamsSchema);
        const item = await service.getPublishedBySlug(slug);
        if (!item) throw ApiError.notFound();
        return ok(item);
      }),
  };
}
