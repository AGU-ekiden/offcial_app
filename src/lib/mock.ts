// NOTION_TOKEN が未設定のときに使うサンプルデータ（ローカル開発・デザイン確認用）。
// 人名・大会名はすべて架空。

import { addDays, todayJst } from "./time";
import type {
  Column,
  EkidenRecord,
  Goods,
  HsBest,
  Member,
  News,
  Onrei,
  Photo,
  Result,
  ScheduleItem,
  Sponsor,
  TeamResult,
} from "./types";

const SAMPLE_NAMES: [string, string, string, string][] = [
  // 氏名, ローマ字, 学年, 出身高校
  ["青山 太郎", "Taro Aoyama", "4年", "架空第一高校"],
  ["渋谷 駿", "Shun Shibuya", "4年", "サンプル学園高校"],
  ["表参道 陽向", "Hinata Omotesando", "3年", "テスト実業高校"],
  ["相模 蒼", "Ao Sagami", "3年", "架空第二高校"],
  ["町田 颯", "Hayate Machida", "2年", "サンプル工業高校"],
  ["淵野辺 湊", "Minato Fuchinobe", "2年", "テスト学院高校"],
  ["緑ヶ丘 遥", "Haruka Midorigaoka", "1年", "架空中央高校"],
  ["若葉 律", "Ritsu Wakaba", "1年", "サンプル南高校"],
];

export function mockMembers(): Member[] {
  const players: Member[] = SAMPLE_NAMES.map(([name, roman, grade, hs], i) => ({
    id: `mock-member-${i + 1}`,
    name,
    nameRoman: roman,
    grade,
    gender: i === 7 ? "女子" : "男子",
    role: "選手",
    position: i === 0 ? "主将" : "",
    highSchool: hs,
    faculty: ["地球社会共生学部", "経営学部", "総合文化政策学部", "教育人間科学部"][i % 4],
    comment: ["チームの勝利のために全力で走ります！", "箱根で区間賞を取ります", "応援よろしくお願いします！"][i % 3],
    achievements: i < 3 ? "架空駅伝 区間賞 / 学生ハーフ 入賞" : "",
    photo: null,
    order: i,
  }));
  const staff: Member[] = [
    {
      id: "mock-staff-1",
      name: "原宿 葵",
      nameRoman: "Aoi Harajuku",
      grade: "3年",
      gender: "女子",
      role: "マネージャー",
      position: "主務",
      highSchool: "",
      faculty: "経営学部",
      comment: "",
      achievements: "",
      photo: null,
      order: 100,
    },
  ];
  const alumni: Member = {
    ...staff[0],
    id: "mock-obog-1",
    name: "神宮 大地",
    nameRoman: "",
    grade: "",
    gender: "男子",
    role: "OBOG",
    position: "",
    faculty: "",
    order: null,
  };
  return [...players, ...staff, alumni];
}

export function mockResults(): Result[] {
  const today = todayJst();
  const meets = [
    { name: "架空記録会", kind: "トラック", venue: "サンプル競技場", date: addDays(today, -6) },
    { name: "第99回 架空駅伝", kind: "駅伝", venue: "架空市", date: addDays(today, -20) },
    { name: "テスト長距離競技会", kind: "トラック", venue: "テストスタジアム", date: addDays(today, -45) },
    { name: "サンプルハーフマラソン", kind: "ロード", venue: "サンプル市", date: addDays(today, -200) },
  ];
  const times5000 = ["13:38.21", "13:45.02", "13:52.77", "14:01.35", "14:05.90", "14:12.48"];
  const out: Result[] = [];
  let n = 0;
  meets.forEach((m, mi) => {
    SAMPLE_NAMES.slice(0, 6).forEach((_, ai) => {
      const ekiden = m.kind === "駅伝";
      const half = m.kind === "ロード";
      out.push({
        id: `mock-result-${++n}`,
        meet: m.name,
        date: m.date,
        venue: m.venue,
        kind: m.kind,
        eventClass: ekiden ? "駅伝" : half ? "ハーフマラソン" : "5000m",
        eventLabel: ekiden ? "駅伝" : half ? "ハーフマラソン" : "5000m",
        heat: ekiden || half ? "" : `${(ai % 2) + 1}組`,
        section: ekiden ? ai + 1 : null,
        distance: ekiden ? [21.3, 23.1, 21.4, 20.9, 20.8, 20.8][ai] : null,
        gender: "男子",
        athleteId: `mock-member-${ai + 1}`,
        rank: ai + 1 + mi,
        time: ekiden ? `1:0${2 + (ai % 3)}:${10 + ai * 7}` : half ? `1:0${1 + (ai % 3)}:${20 + ai * 5}` : times5000[(ai + mi) % 6],
        flags:
          ai === 0 && mi === 0
            ? [{ name: "PB", color: "red" }]
            : ai === 1 && ekiden
              ? [{ name: "区間賞", color: "pink" }]
              : ai === 2 && mi === 2
                ? [{ name: "入賞", color: "orange" }]
                : [],
        note: "",
      });
    });
  });
  // OBOG の結果（名前は出すが個人ページへのリンクはしない）
  out.push({ ...out[out.length - 1], id: `mock-result-${++n}`, athleteId: "mock-obog-1", rank: 12, time: "1:04:02", flags: [] });
  return out;
}

export function mockSchedule(): ScheduleItem[] {
  const today = todayJst();
  return [
    {
      id: "mock-schedule-1",
      title: "第38回 架空大学駅伝対校選手権",
      start: addDays(today, 3),
      end: null,
      venue: "架空県 サンプル市",
      kind: "駅伝",
      target: "男子",
      detail: "区間エントリー\n1区 青山 太郎（4年）\n2区 渋谷 駿（4年）\n3区 表参道 陽向（3年）",
      tbd: false,
      links: [{ label: "大会公式サイト", url: "https://example.com" }],
    },
    {
      id: "mock-schedule-2",
      title: "テスト長距離記録会",
      start: addDays(today, 15),
      end: addDays(today, 16),
      venue: "テストスタジアム",
      kind: "トラック",
      target: "男女",
      detail: "",
      tbd: true,
      links: [],
    },
    {
      id: "mock-schedule-3",
      title: "サンプルハーフマラソン",
      start: addDays(today, 40),
      end: null,
      venue: "サンプル市",
      kind: "ロード",
      target: "男子",
      detail: "",
      tbd: true,
      links: [],
    },
  ];
}

export function mockNews(): News[] {
  const today = todayJst();
  const items: [string, string, number][] = [
    ["架空記録会の結果をアップしました！", "結果", -5],
    ["架空大学駅伝対校選手権の出場予定選手をアップしました！", "予定", -2],
    ["御礼ページを更新しました！", "御礼", -9],
    ["新グッズ「公式タオル」販売開始のお知らせ", "お知らせ", -12],
    ["夏合宿レポートを公開しました", "コラム", -30],
  ];
  return items
    .map(([title, tag, d], i) => ({
      id: `mock-news-${i + 1}`,
      title,
      date: addDays(today, d),
      tag,
      link: "",
      scheduleIds: [],
      resultIds: [],
    }))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function mockColumns(): Column[] {
  const today = todayJst();
  return [
    {
      id: "mock-column-1",
      title: "夏合宿レポート",
      date: addDays(today, -30),
      summary: "標高1,000mを超える高地での1ヶ月。チームが積み上げた走行距離と、選手たちの声をお届けします。",
      thumbnail: null,
    },
    {
      id: "mock-column-2",
      title: "新入生紹介",
      date: addDays(today, -120),
      summary: "今年度入部した新入生のプロフィールと意気込みを紹介します。",
      thumbnail: null,
    },
  ];
}

export function mockSponsors(): Sponsor[] {
  return [
    { id: "mock-sponsor-1", name: "サンプル株式会社", team: "男子", main: true, sub: false, link: "", logo: null, order: 1 },
    { id: "mock-sponsor-2", name: "架空ホールディングス", team: "男子", main: false, sub: true, link: "", logo: null, order: 2 },
    { id: "mock-sponsor-3", name: "テスト製薬", team: "女子", main: true, sub: false, link: "", logo: null, order: 1 },
  ];
}

export function mockGoods(): Goods[] {
  return [
    { id: "mock-goods-1", name: "公式タオル", url: "", photo: null, isNew: true, order: 1 },
    { id: "mock-goods-2", name: "応援Tシャツ", url: "", photo: null, isNew: false, order: 2 },
  ];
}

export function mockOnrei(): Onrei[] {
  const today = todayJst();
  return [
    {
      id: "mock-onrei-1",
      donor: "架空青果店 様",
      date: addDays(today, -9),
      item: "季節のフルーツ",
      message: "いつも温かいご支援をありがとうございます。選手一同、美味しくいただきました。",
      inPhoto: "青山 太郎、渋谷 駿",
      photo: null,
    },
  ];
}

export function mockPhotos(): Photo[] {
  return [];
}

export function mockTeamResults(): TeamResult[] {
  const today = todayJst();
  return [
    {
      id: "mock-team-1",
      meet: "第99回 架空駅伝",
      date: addDays(today, -20),
      division: "総合",
      gender: "男子",
      rank: 1,
      time: "6:21:45",
      flags: [
        { name: "優勝", color: "orange" },
        { name: "大会新記録", color: "orange" },
      ],
      note: "",
      // mockResults() の駅伝（2番目の大会）の個人結果に紐づける
      resultIds: ["mock-result-7"],
    },
    {
      id: "mock-team-2",
      meet: "サンプル市民駅伝",
      date: addDays(today, -60),
      division: "総合",
      gender: "男子",
      rank: 3,
      time: "2:05:28",
      flags: [],
      note: "",
      resultIds: [],
    },
  ];
}

export function mockEkidenRecords(): EkidenRecord[] {
  const rows: [string, string, string, number | null, number | null, string, string][] = [
    ["箱根駅伝", "1区", "青山 太郎", 4, 21.3, "1:01:23", "第100回（2024）"],
    ["箱根駅伝", "2区", "渋谷 駿", 3, 23.1, "1:05:44", "第101回（2025）"],
    ["箱根駅伝", "5区", "表参道 陽向", 4, 20.8, "1:07:16", "第102回（2026）"],
    ["箱根駅伝", "往路", "青山学院大学", null, null, "5:18:08", "第102回（2026）"],
    ["箱根駅伝", "総合結果", "青山学院大学", null, null, "10:37:34", "第102回（2026）"],
    ["出雲駅伝", "1区", "相模 蒼", 4, 8, "22:45", "第34回（2022）"],
    ["出雲駅伝", "総合結果", "青山学院大学", null, null, "2:09:05", "第27回（2015）"],
    ["全日本大学駅伝", "1区", "町田 颯", 4, 9.5, "27:08", "第54回（2022）"],
    ["全日本大学駅伝", "総合結果", "青山学院大学", null, null, "5:09:28", "第57回（2025）"],
  ];
  return rows.map(([race, section, athlete, grade, distance, time, edition], i) => ({
    id: `mock-ekiden-${i + 1}`,
    race,
    section,
    athlete,
    grade,
    distance,
    time,
    edition,
  }));
}

export function mockHsBests(): HsBest[] {
  return [
    { id: "mock-hs-1", athleteId: "mock-member-1", event: "5000m", time: "14:02.11", memo: "" },
    { id: "mock-hs-2", athleteId: "mock-member-1", event: "1500m", time: "3:51.40", memo: "" },
    { id: "mock-hs-3", athleteId: "mock-member-2", event: "5000m", time: "14:10.62", memo: "" },
  ];
}
