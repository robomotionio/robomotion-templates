/** Times are stored as milliseconds since 1970 and shown in the reader's own
 * time zone, never as a raw number or a hand-built date. */
export function formatWhen(ms?: number): string {
  if (!ms) {
    return "—";
  }
  return new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function formatDate(ms?: number): string {
  if (!ms) {
    return "—";
  }
  return new Date(ms).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function plural(count: number, one: string, many: string): string {
  return count === 1 ? `1 ${one}` : `${count} ${many}`;
}
