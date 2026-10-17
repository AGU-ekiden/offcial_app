const TZ = "Asia/Tokyo";

/** 日本時間の今日 (YYYY-MM-DD) */
export function todayJst(now = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(now);
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** 日本の年度（4月始まり）。1〜3月は前年度に属する */
export function nendoOf(isoDate: string): number {
  const [y, m] = isoDate.slice(0, 10).split("-").map(Number);
  return m >= 4 ? y : y - 1;
}

export function nendoRange(nendo: number): { start: string; end: string } {
  return { start: `${nendo}-04-01`, end: `${nendo + 1}-03-31` };
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, wd: WEEKDAYS[wd] };
}

/** 2026.10.17 (土) */
export function formatDate(iso: string | null | undefined, withWeekday = false): string {
  if (!iso) return "";
  const { y, m, d, wd } = parts(iso);
  const base = `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`;
  return withWeekday ? `${base} (${wd})` : base;
}

/** 10/17(土) 〜 10/18(日) */
export function formatDateRange(start: string, end: string | null): string {
  const s = parts(start);
  const head = `${s.m}/${s.d}(${s.wd})`;
  if (!end || end.slice(0, 10) === start.slice(0, 10)) return head;
  const e = parts(end);
  return `${head} 〜 ${e.m}/${e.d}(${e.wd})`;
}

/** "14:13.15" / "1:02:03" / "62:30" などを秒に変換。解釈できなければ null */
export function parseTime(t: string): number | null {
  const s = t.trim().replace(/[：]/g, ":").replace(/[．]/g, ".");
  if (!/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(s)) return null;
  return s.split(":").reduce((acc, part) => acc * 60 + Number(part), 0);
}

/** 2つの YYYY-MM-DD の日数差 (b - a) */
export function daysBetween(a: string, b: string): number {
  const toUtc = (iso: string) => {
    const { y, m, d } = parts(iso);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}
