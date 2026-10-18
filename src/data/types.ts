// アプリ用データ（https://aogaku-tf.com/app/v1/data.json）の形。
// 作っているのは公式サイトのリポジトリの lib/app-data.js。形を変えるときは両方を直す。

export const SCHEMA_VERSION = 1;

export type AppData = {
  schemaVersion: number;
  generatedAt: string;
  siteUrl: string;
  links: {
    results: string;
    schedule: string;
    members: string;
    rankings: string;
  };
  news: NewsItem[];
  schedule: ScheduleItem[];
  meets: Meet[];
  members: Member[];
  videos: Video[];
};

export type NewsItem = {
  id: string;
  title: string;
  date: string;
  /** 「結果」「予定」「お知らせ」など */
  tag: string;
  /** 外部リンク（空なら scheduleId / meetId を見る） */
  url: string;
  scheduleId: string | null;
  meetId: string | null;
};

export type ScheduleItem = {
  id: string;
  name: string;
  date: string;
  dateEnd: string;
  venue: string;
  /** トラック / ロード / 駅伝 */
  category: string;
  /** 男子 / 女子 / 両方 */
  target: string;
  /** 日程が未確定（date は大体の月） */
  undetermined: boolean;
  detail: string;
  links: { url: string; name: string }[];
};

export type Meet = {
  id: string;
  name: string;
  date: string;
  dateEnd: string;
  venue: string;
  category: string;
  races: Race[];
};

export type Race = {
  key: string;
  /** トラック: 「5000m 1組」など。駅伝: チーム名（空なら性別のみ） */
  label: string;
  gender: string;
  isEkiden: boolean;
  rows: ResultRow[];
  teamResults: TeamResult[];
};

export type ResultRow = {
  id: string;
  /** id が null の人は現在の名簿にいない（OB・OGなど） */
  athletes: { id: string | null; name: string }[];
  rank: number | null;
  time: string;
  flags: string[];
  kukan: number | null;
  distanceKm: number | null;
};

export type TeamResult = {
  /** 総合 / 往路 / 復路 */
  part: string;
  rank: number | null;
  time: string;
  flags: string[];
  remarks: string;
};

export type MemberRole = '選手' | 'マネージャー' | 'スタッフ' | (string & {});

export type Member = {
  id: string;
  role: MemberRole;
  name: string;
  nameRoman: string;
  grade: string;
  gender: string;
  /** 主将・主務・寮長・監督 など */
  title: string;
  faculty: string;
  highSchool: string;
  hometown: string;
  photo: string;
  comment: string;
  sortOrder: number | null;
  bests: { event: string; time: string; meet: string; date: string }[];
  recentResults: {
    meet: string;
    date: string;
    event: string;
    kukan: number | null;
    rank: number | null;
    time: string;
    flags: string[];
  }[];
  /** 公式サイトの個人ページ（記録の一覧はこちら） */
  siteUrl: string;
};

export type Video = {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  url: string;
  youtubeId: string | null;
  thumbnail: string;
};
