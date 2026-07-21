export function getPosterUrl(comic: any): string {
  // Prefer the canonical posterUrl; fall back to legacy cover field if present.
  return (comic?.posterUrl as string) ?? (comic as any)?.cover ?? "";
}
