import { compareMembers, todayIso } from './format';
import type { AppData, Member, ScheduleItem } from './types';

/** 今日以降（開催中を含む）の予定。日程未定のものは後ろ */
export function upcomingSchedule(data: AppData, today = todayIso()) {
  return data.schedule
    .filter(s => (s.dateEnd || s.date) >= today)
    .sort((a, b) => Number(a.undetermined) - Number(b.undetermined) || a.date.localeCompare(b.date));
}

export function pastSchedule(data: AppData, today = todayIso()) {
  return data.schedule.filter(s => (s.dateEnd || s.date) < today).sort((a, b) => b.date.localeCompare(a.date));
}

export function nextRace(data: AppData, today = todayIso()): ScheduleItem | undefined {
  return upcomingSchedule(data, today).find(s => !s.undetermined);
}

export function groupByMonth<T extends { date: string }>(items: T[], key: (item: T) => string) {
  const groups: { key: string; items: T[] }[] = [];
  for (const item of items) {
    const k = key(item);
    const last = groups[groups.length - 1];
    if (last && last.key === k) last.items.push(item);
    else groups.push({ key: k, items: [item] });
  }
  return groups;
}

export type RosterGroup = { title: string; members: Member[] };

/** 名簿：選手は学年ごと、スタッフ・マネージャーは最後にまとめる（全員同じ形で表示する） */
export function roster(members: Member[], gender: '全員' | '男子' | '女子'): RosterGroup[] {
  const list = members.filter(m => gender === '全員' || m.gender === gender).sort(compareMembers);
  const athletes = list.filter(m => m.role === '選手');
  const staff = list.filter(m => m.role !== '選手');
  const groups: RosterGroup[] = [];
  for (const grade of ['4年', '3年', '2年', '1年']) {
    const g = athletes.filter(m => m.grade === grade);
    if (g.length) groups.push({ title: grade, members: g });
  }
  const other = athletes.filter(m => !['4年', '3年', '2年', '1年'].includes(m.grade));
  if (other.length) groups.push({ title: '選手', members: other });
  if (staff.length) groups.push({ title: 'マネージャー・スタッフ', members: staff });
  return groups;
}

export function findMember(data: AppData | null, id: string | undefined) {
  return data?.members.find(m => m.id === id);
}
