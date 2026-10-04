/** Sunucunun izin verdiği en büyük sayfa (yorum ve lead listeleri). */
export const MAX_PAGE_SIZE = 100

export interface Page<T> {
  items: T[]
  nextCursor: string | null
}

/**
 * İmleçli listeyi `limit`'e kadar toplar; `limit` sonsuzsa son sayfaya kadar gider. Sunucu
 * aynı imleci yeniden dönerse döngü kesilir.
 */
export async function collectPages<T>(
  fetchPage: (cursor: string | undefined, pageSize: number) => Promise<Page<T>>,
  limit: number,
): Promise<T[]> {
  const collected: T[] = []
  let cursor: string | undefined
  while (collected.length < limit) {
    const pageSize = Math.min(MAX_PAGE_SIZE, limit - collected.length)
    const page = await fetchPage(cursor, pageSize)
    collected.push(...page.items.slice(0, limit - collected.length))
    if (!page.nextCursor || page.nextCursor === cursor || page.items.length === 0) break
    cursor = page.nextCursor
  }
  return collected
}
