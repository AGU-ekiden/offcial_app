import type { Tag } from "./notion/props";

export type { Tag };

export type News = {
  id: string;
  title: string;
  date: string | null;
  tag: string;
  link: string;
  scheduleIds: string[];
  resultIds: string[];
};

export type Column = {
  id: string;
  title: string;
  date: string | null;
  summary: string;
  thumbnail: string | null;
};

/** 部員。生年月日・暗証番号・点呼タグなどの内部情報は意図的に持たない */
export type Member = {
  id: string;
  name: string;
  nameRoman: string;
  grade: string;
  gender: string;
  role: string;
  position: string;
  highSchool: string;
  faculty: string;
  comment: string;
  achievements: string;
  photo: string | null;
  order: number | null;
};

export type MemberName = { id: string; name: string; grade: string };

export type ScheduleItem = {
  id: string;
  title: string;
  start: string;
  end: string | null;
  venue: string;
  kind: string;
  target: string;
  detail: string;
  tbd: boolean;
  links: { label: string; url: string }[];
};

export type Result = {
  id: string;
  meet: string;
  date: string;
  venue: string;
  kind: string;
  eventClass: string;
  eventLabel: string;
  heat: string;
  section: number | null;
  distance: number | null;
  gender: string;
  athleteId: string | null;
  rank: number | null;
  time: string;
  flags: Tag[];
  note: string;
};

export type Meet = {
  key: string;
  name: string;
  date: string;
  venue: string;
  kind: string;
  results: Result[];
};

export type Sponsor = {
  id: string;
  name: string;
  team: string;
  main: boolean;
  sub: boolean;
  link: string;
  logo: string | null;
  order: number | null;
};

export type Goods = {
  id: string;
  name: string;
  url: string;
  photo: string | null;
  isNew: boolean;
  order: number | null;
};

export type Onrei = {
  id: string;
  donor: string;
  date: string | null;
  item: string;
  message: string;
  inPhoto: string;
  photo: string | null;
};

export type Photo = {
  id: string;
  title: string;
  date: string | null;
  src: string;
  athleteIds: string[];
  hero: boolean;
  note: string;
};

export type PersonalBest = { event: string; time: string; date: string; meet: string };

/** 高校時代の自己ベスト（高校自己ベストDB） */
export type HsBest = { id: string; athleteId: string | null; event: string; time: string; memo: string };

/** チームとしての大会結果（大学結果DB）。複数日程の駅伝は 往路/復路/総合 で1行ずつ */
export type TeamResult = {
  id: string;
  meet: string;
  date: string;
  division: string;
  gender: string;
  rank: number | null;
  time: string;
  flags: Tag[];
  note: string;
  resultIds: string[];
};

/** 三大駅伝の区間ごとの青学記録（駅伝青学記録DB） */
export type EkidenRecord = {
  id: string;
  race: string;
  section: string;
  athlete: string;
  grade: number | null;
  distance: number | null;
  time: string;
  edition: string;
};
