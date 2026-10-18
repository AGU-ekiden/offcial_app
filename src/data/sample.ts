// 開発用のサンプルデータ（人名・記録はすべて架空）。
// EXPO_PUBLIC_USE_SAMPLE_DATA=1 のとき、またはサイトのデータにまだつながらないときの画面確認に使う。

import type { AppData, Member, Meet, ResultRow } from './types';

function day(offset: number) {
  const d = new Date(Date.now() + 9 * 3600 * 1000 + offset * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

const SITE = 'https://aogaku-tf.com/';

const people: [string, string, string, string, string][] = [
  // 氏名, ローマ字, 学年, 学部, 出身高校
  ['青山 一真', 'Kazuma Aoyama', '4年', '経営学部 経営学科', '緑ヶ丘高校'],
  ['渋谷 蒼', 'Aoi Shibuya', '4年', '地球社会共生学部', '若葉台高校'],
  ['相模 陽翔', 'Haruto Sagami', '3年', '総合文化政策学部', '北浜高校'],
  ['表参道 湊', 'Minato Omotesando', '3年', '経済学部 経済学科', '桜川高校'],
  ['宮益 蓮', 'Ren Miyamasu', '2年', '文学部 史学科', '南台高校'],
  ['淵野辺 悠真', 'Yuma Fuchinobe', '2年', 'コミュニティ人間科学部', '白樺高校'],
  ['外苑 大和', 'Yamato Gaien', '1年', '理工学部 情報テクノロジー学科', '東雲高校'],
  ['神宮 律', 'Ritsu Jingu', '1年', '国際政治経済学部', '若草高校'],
];

const members: Member[] = [
  ...people.map(
    ([name, nameRoman, grade, faculty, highSchool], i): Member => ({
      id: `sample-m${i + 1}`,
      role: '選手',
      name,
      nameRoman,
      grade,
      gender: '男子',
      title: i === 0 ? '主将' : i === 2 ? '寮長' : '',
      faculty,
      highSchool,
      hometown: ['東京都', '神奈川県', '静岡県', '福岡県', '長野県', '兵庫県', '宮城県', '広島県'][i],
      photo: '',
      comment:
        i === 0
          ? 'チーム全員で同じ目標に向かう一年にします。応援よろしくお願いします。'
          : '一日一日の練習を大切に、4年間で大きく成長したいです。',
      sortOrder: null,
      bests: [
        {
          event: '5000m',
          time: `13:${String(48 + i * 2).padStart(2, '0')}.${10 + i}`,
          meet: '記録会',
          date: day(-120),
        },
        {
          event: '10000m',
          time: `28:${String(30 + i * 3).padStart(2, '0')}.${20 + i}`,
          meet: '記録会',
          date: day(-60),
        },
        ...(i < 4
          ? [
              {
                event: 'ハーフマラソン',
                time: `1:0${2 + (i % 2)}:${String(10 + i * 7).padStart(2, '0')}`,
                meet: 'ハーフマラソン',
                date: day(-200),
              },
            ]
          : []),
      ],
      recentResults: [
        {
          meet: '出雲全日本大学選抜駅伝',
          date: day(-5),
          event: '駅伝',
          kukan: (i % 6) + 1,
          rank: (i % 3) + 1,
          time: `2${i % 4}:${String(10 + i * 4).padStart(2, '0')}`,
          flags: i === 1 ? ['区間賞'] : [],
        },
        {
          meet: '日体大記録会',
          date: day(-30),
          event: '10000m 2組',
          kukan: null,
          rank: i + 2,
          time: `28:${String(40 + i * 3).padStart(2, '0')}.${11 + i}`,
          flags: i % 3 === 0 ? ['PB'] : [],
        },
      ],
      siteUrl: `${SITE}members.html`,
    }),
  ),
  {
    id: 'sample-s1',
    role: 'マネージャー',
    name: '青葉 結衣',
    nameRoman: 'Yui Aoba',
    grade: '4年',
    gender: '女子',
    title: '主務',
    faculty: '教育人間科学部',
    highSchool: '朝日高校',
    hometown: '',
    photo: '',
    comment: '選手が走ることに集中できるよう、チームを支えています。',
    sortOrder: null,
    bests: [],
    recentResults: [],
    siteUrl: '',
  },
  {
    id: 'sample-s2',
    role: 'マネージャー',
    name: '代々木 颯',
    nameRoman: 'Hayate Yoyogi',
    grade: '3年',
    gender: '男子',
    title: 'トレーナー',
    faculty: '社会情報学部',
    highSchool: '港南高校',
    hometown: '',
    photo: '',
    comment: '',
    sortOrder: null,
    bests: [],
    recentResults: [],
    siteUrl: '',
  },
];

const ekidenRows: ResultRow[] = [8.0, 5.8, 8.5, 6.2, 6.4, 10.2].map((km, i) => ({
  id: `sample-r${i + 1}`,
  athletes: [{ id: `sample-m${i + 1}`, name: people[i][0] }],
  rank: [2, 1, 3, 1, 2, 1][i],
  time: ['23:21', '15:58', '24:30', '17:44', '18:30', '28:55'][i],
  flags: i === 1 || i === 3 ? ['区間賞'] : [],
  kukan: i + 1,
  distanceKm: km,
}));

const meets: Meet[] = [
  {
    id: 'sample-meet1',
    name: '出雲全日本大学選抜駅伝',
    date: day(-5),
    dateEnd: day(-5),
    venue: '出雲大社〜出雲ドーム',
    category: '駅伝',
    races: [
      {
        key: 'e',
        label: '',
        gender: '男子',
        isEkiden: true,
        rows: ekidenRows,
        teamResults: [{ part: '総合', rank: 2, time: '2:08:58', flags: [], remarks: '' }],
      },
    ],
  },
  {
    id: 'sample-meet2',
    name: '日体大長距離競技会',
    date: day(-30),
    dateEnd: day(-29),
    venue: '健志台陸上競技場',
    category: 'トラック',
    races: [
      {
        key: 't1',
        label: '10000m 2組',
        gender: '男子',
        isEkiden: false,
        teamResults: [],
        rows: [4, 5, 6].map((n, i) => ({
          id: `sample-t${n}`,
          athletes: [{ id: `sample-m${n}`, name: people[n - 1][0] }],
          rank: i + 2,
          time: `28:${String(40 + i * 5).padStart(2, '0')}.${12 + i}`,
          flags: i === 0 ? ['PB'] : [],
          kukan: null,
          distanceKm: null,
        })),
      },
      {
        key: 't2',
        label: '5000m 5組',
        gender: '男子',
        isEkiden: false,
        teamResults: [],
        rows: [7, 8].map((n, i) => ({
          id: `sample-u${n}`,
          athletes: [{ id: `sample-m${n}`, name: people[n - 1][0] }],
          rank: i + 1,
          time: `13:${String(55 + i * 3).padStart(2, '0')}.0${i + 4}`,
          flags: ['PB'],
          kukan: null,
          distanceKm: null,
        })),
      },
    ],
  },
];

export function sampleData(): AppData {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    siteUrl: SITE,
    links: {
      results: `${SITE}results.html`,
      schedule: `${SITE}schedule.html`,
      members: `${SITE}members.html`,
      rankings: `${SITE}rankings.html`,
    },
    news: [
      {
        id: 'sample-n1',
        title: '出雲全日本大学選抜駅伝の結果',
        date: day(-5),
        tag: '結果',
        url: '',
        scheduleId: null,
        meetId: 'sample-meet1',
      },
      {
        id: 'sample-n2',
        title: '全日本大学駅伝 出場メンバーのお知らせ',
        date: day(-2),
        tag: '予定',
        url: '',
        scheduleId: 'sample-sc1',
        meetId: null,
      },
      {
        id: 'sample-n3',
        title: '夏合宿の様子を公開しました',
        date: day(-12),
        tag: 'お知らせ',
        url: '',
        scheduleId: null,
        meetId: null,
      },
      {
        id: 'sample-n4',
        title: '日体大長距離競技会の結果',
        date: day(-29),
        tag: '結果',
        url: '',
        scheduleId: null,
        meetId: 'sample-meet2',
      },
    ].sort((a, b) => b.date.localeCompare(a.date)),
    schedule: [
      {
        id: 'sample-sc1',
        name: '全日本大学駅伝対校選手権',
        date: day(16),
        dateEnd: day(16),
        venue: '熱田神宮〜伊勢神宮',
        category: '駅伝',
        target: '男子',
        undetermined: false,
        detail: '',
        links: [],
      },
      {
        id: 'sample-sc2',
        name: '世田谷246ハーフマラソン',
        date: day(29),
        dateEnd: day(29),
        venue: '駒沢オリンピック公園',
        category: 'ロード',
        target: '男子',
        undetermined: false,
        detail: '',
        links: [],
      },
      {
        id: 'sample-sc3',
        name: '日体大長距離競技会',
        date: day(36),
        dateEnd: day(37),
        venue: '健志台陸上競技場',
        category: 'トラック',
        target: '両方',
        undetermined: false,
        detail: '',
        links: [],
      },
      {
        id: 'sample-sc4',
        name: '東京箱根間往復大学駅伝競走',
        date: day(76),
        dateEnd: day(77),
        venue: '大手町〜箱根・芦ノ湖',
        category: '駅伝',
        target: '男子',
        undetermined: false,
        detail: '',
        links: [],
      },
      {
        id: 'sample-sc5',
        name: '春の記録会',
        date: day(150),
        dateEnd: day(150),
        venue: '未定',
        category: 'トラック',
        target: '両方',
        undetermined: true,
        detail: '',
        links: [],
      },
    ],
    meets,
    members,
    videos: [
      {
        id: 'sample-v1',
        title: '学内タイムトライアル 10000m',
        date: day(-8),
        category: 'タイムトライアル',
        description: '寮のグラウンドで行った学内タイムトライアル。',
        url: '',
        youtubeId: null,
        thumbnail: '',
      },
      {
        id: 'sample-v2',
        title: '夏合宿 ポイント練習',
        date: day(-40),
        category: '合宿',
        description: '標高の高いコースでの30km走。',
        url: '',
        youtubeId: null,
        thumbnail: '',
      },
      {
        id: 'sample-v3',
        title: '朝練習の一日',
        date: day(-55),
        category: '寮生活',
        description: '朝5時半からの練習と、寮での朝食まで。',
        url: '',
        youtubeId: null,
        thumbnail: '',
      },
    ],
  };
}
