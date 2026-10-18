// 日付・表示用の小さな関数。日付は Notion の「YYYY-MM-DD」（日本時間）をそのまま扱う。

import type { Member, ScheduleItem } from './types';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/** 今日の日付（日本時間）YYYY-MM-DD */
export function todayIso(now = Date.now()) {
  return new Date(now + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return { y, m, d, w: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** 10月13日(月) */
export function formatDate(iso: string, opts: { year?: boolean; weekday?: boolean } = {}) {
  if (!iso) return '';
  const { y, m, d, w } = parts(iso);
  const wd = opts.weekday === false ? '' : `(${WEEKDAYS[w]})`;
  return `${opts.year ? `${y}年` : ''}${m}月${d}日${wd}`;
}

/** 10月13日(月)〜14日(火) */
export function formatDateRange(start: string, end: string, opts: { year?: boolean } = {}) {
  if (!end || end === start) return formatDate(start, opts);
  const a = parts(start);
  const b = parts(end);
  const tail = a.m === b.m ? `${b.d}日(${WEEKDAYS[b.w]})` : formatDate(end);
  return `${formatDate(start, opts)}〜${tail}`;
}

/** 2026.10.13 */
export function formatDot(iso: string) {
  if (!iso) return '';
  const { y, m, d } = parts(iso);
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
}

export function monthLabel(iso: string) {
  const { y, m } = parts(iso);
  return `${y}年${m}月`;
}

/** 今日から何日後か（今日=0） */
export function daysUntil(iso: string, now = Date.now()) {
  const a = parts(todayIso(now));
  const b = parts(iso);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000);
}

export function scheduleDateLabel(s: ScheduleItem) {
  if (s.undetermined) return `${parts(s.date).m}月頃（日程未定）`;
  return formatDateRange(s.date, s.dateEnd);
}

export function rankLabel(rank: number | null) {
  return rank == null ? '' : `${rank}位`;
}

/** 部員の肩書き（「4年・主将」「マネージャー・主務」など） */
export function memberSubtitle(m: Member) {
  const head = m.role === '選手' ? m.grade : [m.role, m.grade].filter(Boolean).join(' ');
  return [head, m.title].filter(Boolean).join('・');
}

const GRADE_ORDER = ['4年', '3年', '2年', '1年'];

/** 名簿の並び順：学年（上級生から）→ 掲載順 → 名前 */
export function compareMembers(a: Member, b: Member) {
  const ga = GRADE_ORDER.indexOf(a.grade);
  const gb = GRADE_ORDER.indexOf(b.grade);
  return (
    (ga === -1 ? 99 : ga) - (gb === -1 ? 99 : gb) ||
    (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
    a.name.localeCompare(b.name, 'ja')
  );
}
