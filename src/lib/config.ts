// Notion の DB ID。環境変数名は公式サイト(agu-ekiden-site)と揃えているので、同じ値をそのまま使える。
export const DB = {
  news: process.env.NOTION_DB_NEWS ?? "",
  members: process.env.NOTION_DB_MEMBERS ?? "",
  results: process.env.NOTION_DB_RESULTS ?? "",
  schedule: process.env.NOTION_DB_SCHEDULE ?? "",
  onrei: process.env.NOTION_DB_ONREI ?? "",
  sponsors: process.env.NOTION_DB_SPONSORS ?? "",
  photos: process.env.NOTION_DB_PHOTOS ?? "",
  columns: process.env.NOTION_DB_COLUMNS ?? "",
  goods: process.env.NOTION_DB_GOODS ?? "",
  hsBests: process.env.NOTION_DB_HS_BESTS ?? "",
  teamResults: process.env.NOTION_DB_TEAM_RESULTS ?? "",
  ekidenRecords: process.env.NOTION_DB_EKIDEN_RECORDS ?? "",
};

export type DbKey = keyof typeof DB;

/** /api/img で配信してよい「DB × ファイル列」の組み合わせ（個人情報を含む列は絶対に追加しないこと） */
export const PUBLIC_FILE_PROPS: Partial<Record<DbKey, string[]>> = {
  members: ["写真"],
  photos: ["写真"],
  onrei: ["写真"],
  sponsors: ["ロゴ画像"],
  goods: ["写真"],
  columns: ["サムネイル"],
};

/** 本文ブロック内の画像を /api/img で配信してよい DB */
export const PUBLIC_BODY_DBS: DbKey[] = ["columns", "news", "schedule"];

export const SITE = {
  name: "青山学院大学 陸上競技部 長距離ブロック",
  shortName: "AGU EKIDEN",
  description: "青山学院大学陸上競技部（長距離ブロック）公式アプリ。最新ニュース、選手名鑑、大会日程・結果をお届けします。",
  officialSite: "https://aogaku-tf.com/",
  // 公式SNSのURL。空のものは表示されない。
  sns: [
    { label: "Instagram", url: process.env.NEXT_PUBLIC_SNS_INSTAGRAM ?? "" },
    { label: "X", url: process.env.NEXT_PUBLIC_SNS_X ?? "" },
    { label: "YouTube", url: process.env.NEXT_PUBLIC_SNS_YOUTUBE ?? "" },
  ].filter((s) => s.url),
};
