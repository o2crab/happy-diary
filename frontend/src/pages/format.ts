import type { CycleSummary } from "../api/schema";

export type Verdict = NonNullable<CycleSummary["verdict"]>;

export const VERDICT_LABELS: Record<Verdict, string> = {
  supported: "支持された",
  not_supported: "支持されなかった",
  inconclusive: "判断できない",
};

export const HAPPINESS_LABELS: Record<number, string> = {
  1: "とてもつらい",
  2: "つらい",
  3: "ふつう",
  4: "よい",
  5: "とてもよい",
};

export function happinessLabel(happiness: number): string {
  return `${happiness} ${HAPPINESS_LABELS[happiness] ?? ""}`.trim();
}

/** ローカル時刻の日付を YYYY-MM-DD で返します。 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function today(): string {
  return toDateString(new Date());
}

export function addDays(dateString: string, days: number): string {
  const [year = 0, month = 1, day = 1] = dateString.split("-").map(Number);
  return toDateString(new Date(year, month - 1, day + days));
}

/** YYYY-MM-DD を「2026年11月28日」の形にします。 */
export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

export function formatPeriod(startDate: string, endDate: string): string {
  return `${formatDate(startDate)}〜${formatDate(endDate)}`;
}

export function formatAverage(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}
