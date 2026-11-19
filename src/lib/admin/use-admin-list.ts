"use client";

import { useEffect, useState } from "react";

import { apiRequest, errorMessage, type ListMeta } from "@/lib/admin/api-client";

/*
 * Server-side list: one page at a time, filtered and searched by the API.
 * Debounced search, a status filter and "load more" pagination.
 * Loading state is derived from which query the current items belong to,
 * so no state is set synchronously inside effects.
 */

type ListState<T> = { key: string; items: T[]; meta: ListMeta | null; error: string | null };

export function useAdminList<T extends { id: string }>(
  path: string,
  options: { pageSize?: number; filters?: Record<string, string | undefined> } = {},
) {
  const pageSize = options.pageSize ?? 20;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<ListState<T>>({ key: "", items: [], meta: null, error: null });
  const [loadingMore, setLoadingMore] = useState(false);

  const filters = options.filters ?? {};
  const filterKey = JSON.stringify(filters);
  const key = JSON.stringify([path, search, status, filterKey, pageSize, reloadCount]);

  // Debounce the search box.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<T[]>(path, {
      query: { search, status, page: 1, pageSize, ...JSON.parse(filterKey) },
      signal: controller.signal,
    })
      .then((result) => setState({ key, items: result.data, meta: result.meta ?? null, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ key, items: [], meta: null, error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [key, path, search, status, filterKey, pageSize]);

  const loading = state.key !== key;
  const meta = state.meta;
  const hasMore = Boolean(meta && meta.page < meta.totalPages);

  async function loadMore() {
    if (!meta || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await apiRequest<T[]>(path, {
        query: { search, status, page: meta.page + 1, pageSize, ...filters },
      });
      setState((current) => ({
        ...current,
        items: [...current.items, ...result.data.filter((item) => !current.items.some((i) => i.id === item.id))],
        meta: result.meta ?? current.meta,
      }));
    } catch (error) {
      setState((current) => ({ ...current, error: errorMessage(error) }));
    } finally {
      setLoadingMore(false);
    }
  }

  return {
    items: state.items,
    total: meta?.total ?? 0,
    error: state.error,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    searchInput,
    setSearchInput,
    status,
    setStatus,
    reload: () => setReloadCount((count) => count + 1),
    replaceItem: (item: T) =>
      setState((current) => ({ ...current, items: current.items.map((i) => (i.id === item.id ? item : i)) })),
    removeItem: (id: string) =>
      setState((current) => ({
        ...current,
        items: current.items.filter((i) => i.id !== id),
        meta: current.meta ? { ...current.meta, total: Math.max(0, current.meta.total - 1) } : null,
      })),
  };
}
