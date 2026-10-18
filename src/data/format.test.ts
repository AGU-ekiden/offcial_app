import { compareMembers, daysUntil, formatDate, formatDateRange, memberSubtitle, scheduleDateLabel } from './format';
import type { Member, ScheduleItem } from './types';

const member = (over: Partial<Member>): Member => ({
  id: 'x',
  role: '選手',
  name: '',
  nameRoman: '',
  grade: '',
  gender: '',
  title: '',
  faculty: '',
  highSchool: '',
  hometown: '',
  photo: '',
  comment: '',
  sortOrder: null,
  bests: [],
  recentResults: [],
  siteUrl: '',
  ...over,
});

describe('format', () => {
  it('formats dates in Japanese', () => {
    expect(formatDate('2026-10-13')).toBe('10月13日(火)');
    expect(formatDate('2027-01-02', { year: true })).toBe('2027年1月2日(土)');
    expect(formatDateRange('2027-01-02', '2027-01-03')).toBe('1月2日(土)〜3日(日)');
    expect(formatDateRange('2026-10-31', '2026-11-01')).toBe('10月31日(土)〜11月1日(日)');
  });

  it('counts days in JST', () => {
    const now = Date.parse('2026-10-18T15:30:00Z'); // 日本時間 10/19 0:30
    expect(daysUntil('2026-10-19', now)).toBe(0);
    expect(daysUntil('2026-11-02', now)).toBe(14);
  });

  it('labels undetermined schedules by month', () => {
    const s = { date: '2027-04-10', dateEnd: '2027-04-10', undetermined: true } as ScheduleItem;
    expect(scheduleDateLabel(s)).toBe('4月頃（日程未定）');
  });

  it('orders members by grade, then sort order, then name', () => {
    const list = [
      member({ name: 'う', grade: '1年' }),
      member({ name: 'い', grade: '4年' }),
      member({ name: 'あ', grade: '4年', sortOrder: 2 }),
      member({ name: 'え', grade: '' }),
    ].sort(compareMembers);
    expect(list.map(m => m.name)).toEqual(['あ', 'い', 'う', 'え']);
  });

  it('builds subtitles for athletes and staff the same way', () => {
    expect(memberSubtitle(member({ grade: '4年', title: '主将' }))).toBe('4年・主将');
    expect(memberSubtitle(member({ role: 'マネージャー', grade: '3年', title: '主務' }))).toBe(
      'マネージャー 3年・主務',
    );
  });
});
