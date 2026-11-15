/** Keep first occurrence of each URL (e.g. turntable ±180 share one plate). */
export function uniqueSrcs(list: readonly string[] | null | undefined): string[] {
  if (!list?.length) return []
  const seen = new Set<string>()
  const unique: string[] = []
  for (const src of list) {
    if (seen.has(src)) continue
    seen.add(src)
    unique.push(src)
  }
  return unique
}
