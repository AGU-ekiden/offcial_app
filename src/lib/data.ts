// アプリが使うデータ取得関数。すべて Notion から取得し "use cache" でキャッシュする。
// NOTION_TOKEN が未設定の場合はサンプルデータ(mock.ts)を返すので、トークン無しでも画面を確認できる。
//
// 反映タイミング:
//   - お知らせ・予定: 1分ごとに裏で再取得（cacheLife "minutes"）
//   - 部員・結果など: 1時間ごと（cacheLife "hours"）
//   - すぐ反映したいときは /api/revalidate を叩く（README 参照）

import { cacheLife, cacheTag } from "next/cache";
import { DB, PUBLIC_BODY_DBS, PUBLIC_FILE_PROPS, type DbKey } from "./config";
import {
  isNotionConfigured,
  listBlocks,
  queryDatabase,
  retrieveBlock,
  retrievePage,
  type NotionBlock,
  type NotionPage,
} from "./notion/client";
import {
  toColumn,
  toGoods,
  toMember,
  toMemberName,
  toNews,
  toOnrei,
  toPhoto,
  toResult,
  toSchedule,
  toSponsor,
} from "./notion/mappers";
import { checkbox, fileUrl, files } from "./notion/props";
import * as mock from "./mock";
import { addDays, nendoOf, nendoRange, parseTime, todayJst } from "./time";
import type { Meet, Member, MemberName, PersonalBest, Photo, Result } from "./types";

export const CACHE_TAG = "notion";

const PUBLISHED = { property: "公開", checkbox: { equals: true } };
const BY_DATE_DESC = [{ property: "日付", direction: "descending" }];

function fromNotion(db: DbKey): boolean {
  return isNotionConfigured() && Boolean(DB[db]);
}

const normalizeId = (id: string) => id.replace(/-/g, "");

/* ───────── お知らせ・コラム ───────── */

export async function getNews(limit = 50) {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG, "news");
  if (!fromNotion("news")) return mock.mockNews().slice(0, limit);
  const pages = await queryDatabase(DB.news, { filter: PUBLISHED, sorts: BY_DATE_DESC }, limit);
  return pages.map(toNews);
}

export async function getColumns(limit = 50) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "columns");
  if (!fromNotion("columns")) return mock.mockColumns().slice(0, limit);
  const pages = await queryDatabase(DB.columns, { filter: PUBLISHED, sorts: BY_DATE_DESC }, limit);
  return pages.map(toColumn);
}

/** 公開DBに属し「公開」にチェックが入っているページか */
function isPublicPageOf(page: NotionPage, dbs: DbKey[]): DbKey | null {
  if (page.archived || page.in_trash) return null;
  if (!checkbox(page.properties, "公開")) return null;
  const parent = page.parent.database_id ? normalizeId(page.parent.database_id) : "";
  return dbs.find((k) => DB[k] && normalizeId(DB[k]) === parent) ?? null;
}

/** コラム・お知らせ本文（Notionページの中身）を取得 */
export async function getArticle(id: string, kind: "columns" | "news") {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, kind);
  if (!fromNotion(kind)) {
    if (kind === "columns") {
      const c = mock.mockColumns().find((x) => x.id === id);
      return c ? { title: c.title, date: c.date, summary: c.summary, blocks: mockBlocks(c.summary) } : null;
    }
    const n = mock.mockNews().find((x) => x.id === id);
    return n ? { title: n.title, date: n.date, summary: "", blocks: mockBlocks(n.title) } : null;
  }
  let page: NotionPage;
  try {
    page = await retrievePage(id);
  } catch {
    return null;
  }
  if (!isPublicPageOf(page, [kind])) return null;
  const meta = kind === "columns" ? toColumn(page) : { ...toNews(page), summary: "" };
  const blocks = await listBlocks(page.id);
  return { title: meta.title, date: meta.date, summary: meta.summary, blocks };
}

function mockBlocks(textBody: string): NotionBlock[] {
  return [
    {
      id: "mock-block",
      type: "paragraph",
      has_children: false,
      parent: { type: "page_id" },
      paragraph: { rich_text: [{ plain_text: textBody, href: null }] },
    },
  ];
}

/* ───────── 部員 ───────── */

const ROLE_ORDER = ["選手", "マネージャー", "スタッフ", "フィジカルトレーナー", "メディカルトレーナー"];
const GRADE_ORDER = ["4年", "3年", "2年", "1年"];

function sortMembers(a: Member, b: Member) {
  const r = ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
  if (r) return r;
  const g = GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade);
  if (g) return g;
  return (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name, "ja");
}

/** 現役の部員（選手・スタッフ）。OBOG と学年未設定の選手は含めない */
export async function getMembers(): Promise<Member[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "members");
  const all = fromNotion("members")
    ? (
        await queryDatabase(DB.members, {
          filter: { and: [PUBLISHED, { property: "区分", select: { does_not_equal: "OBOG" } }] },
        })
      ).map(toMember)
    : mock.mockMembers();
  return all.filter((m) => m.role !== "OBOG" && (m.role !== "選手" || m.grade)).sort(sortMembers);
}

export async function getMember(id: string): Promise<Member | null> {
  const members = await getMembers();
  return members.find((m) => normalizeId(m.id) === normalizeId(id)) ?? null;
}

/** 結果表示用の名前引き（OBOG を含む全公開部員） */
export async function getMemberNames(): Promise<Record<string, MemberName>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "members");
  const list = fromNotion("members")
    ? (await queryDatabase(DB.members, { filter: PUBLISHED })).map(toMemberName)
    : mock.mockMembers().map((m) => ({ id: m.id, name: m.name, grade: m.grade }));
  return Object.fromEntries(list.map((m) => [m.id, m]));
}

/* ───────── 競技結果 ───────── */

function groupMeets(results: Result[]): Meet[] {
  const map = new Map<string, Meet>();
  for (const r of results) {
    const key = `${r.date}|${r.meet}`;
    let meet = map.get(key);
    if (!meet) {
      meet = { key, name: r.meet, date: r.date, venue: r.venue, kind: r.kind, results: [] };
      map.set(key, meet);
    }
    meet.results.push(r);
  }
  const meets = [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
  for (const m of meets) {
    m.results.sort(
      (a, b) =>
        a.eventLabel.localeCompare(b.eventLabel, "ja") ||
        a.heat.localeCompare(b.heat, "ja", { numeric: true }) ||
        (a.section ?? 99) - (b.section ?? 99) ||
        (a.rank ?? 9999) - (b.rank ?? 9999),
    );
  }
  return meets;
}

export async function getResultsByNendo(nendo: number): Promise<Meet[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "results");
  if (!fromNotion("results")) return groupMeets(mock.mockResults().filter((r) => nendoOf(r.date) === nendo));
  const { start, end } = nendoRange(nendo);
  const pages = await queryDatabase(DB.results, {
    filter: {
      and: [
        PUBLISHED,
        { property: "日付", date: { on_or_after: start } },
        { property: "日付", date: { on_or_before: end } },
      ],
    },
    sorts: BY_DATE_DESC,
  });
  return groupMeets(pages.map(toResult));
}

export async function getRecentMeets(count = 3): Promise<Meet[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG, "results");
  const results = fromNotion("results")
    ? (await queryDatabase(DB.results, { filter: PUBLISHED, sorts: BY_DATE_DESC }, 80)).map(toResult)
    : mock.mockResults();
  return groupMeets(results).slice(0, count);
}

/** 結果が存在する年度の一覧（新しい順） */
export async function getNendoList(): Promise<number[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAG, "results");
  const current = nendoOf(todayJst());
  let oldest = current;
  if (fromNotion("results")) {
    const [first] = await queryDatabase(
      DB.results,
      { filter: PUBLISHED, sorts: [{ property: "日付", direction: "ascending" }] },
      1,
    );
    if (first) oldest = nendoOf(toResult(first).date || todayJst());
  } else {
    oldest = Math.min(...mock.mockResults().map((r) => nendoOf(r.date)));
  }
  return Array.from({ length: current - oldest + 1 }, (_, i) => current - i);
}

export async function getMemberResults(memberId: string): Promise<Result[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "results");
  if (!fromNotion("results")) {
    return mock
      .mockResults()
      .filter((r) => r.athleteId === memberId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  const pages = await queryDatabase(DB.results, {
    filter: { and: [PUBLISHED, { property: "選手名", relation: { contains: memberId } }] },
    sorts: BY_DATE_DESC,
  });
  return pages.map(toResult);
}

const PB_EVENTS = ["1500m", "3000m", "3000mSC", "5000m", "10000m", "ハーフマラソン", "マラソン"];
const EXCLUDED_FLAGS = new Set(["DNF", "DNS", "非公認", "ペースメーカー"]);

/** 結果DBから種目ごとの自己ベストを算出する（部員DBに手入力しなくても最新になる） */
export function personalBests(results: Result[]): PersonalBest[] {
  const best = new Map<string, { sec: number; r: Result }>();
  for (const r of results) {
    if (r.kind === "駅伝" || r.flags.some((f) => EXCLUDED_FLAGS.has(f.name))) continue;
    const event = r.eventClass === "フルマラソン" ? "マラソン" : r.eventClass;
    if (!PB_EVENTS.includes(event)) continue;
    const sec = parseTime(r.time);
    if (sec === null) continue;
    const cur = best.get(event);
    if (!cur || sec < cur.sec) best.set(event, { sec, r });
  }
  return PB_EVENTS.filter((e) => best.has(e)).map((e) => {
    const { r } = best.get(e)!;
    return { event: e, time: r.time, date: r.date, meet: r.meet };
  });
}

/* ───────── 予定 ───────── */

export async function getSchedule() {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG, "schedule");
  const today = todayJst();
  const items = fromNotion("schedule")
    ? (
        await queryDatabase(DB.schedule, {
          // 複数日開催で開始日が過ぎていても終了日前なら表示したいので2週間前から取る
          filter: { and: [PUBLISHED, { property: "日付", date: { on_or_after: addDays(today, -14) } }] },
          sorts: [{ property: "日付", direction: "ascending" }],
        })
      ).map(toSchedule)
    : mock.mockSchedule();
  return items
    .filter((s) => s.start && (s.end ?? s.start).slice(0, 10) >= today)
    .sort((a, b) => a.start.localeCompare(b.start));
}

/* ───────── 応援（スポンサー・グッズ・御礼・写真） ───────── */

const byOrder = <T extends { order: number | null }>(a: T, b: T) => (a.order ?? 999) - (b.order ?? 999);

export async function getSponsors() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "sponsors");
  if (!fromNotion("sponsors")) return mock.mockSponsors();
  return (await queryDatabase(DB.sponsors, { filter: PUBLISHED })).map(toSponsor).sort(byOrder);
}

export async function getGoods() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "goods");
  if (!fromNotion("goods")) return mock.mockGoods();
  return (await queryDatabase(DB.goods, { filter: PUBLISHED })).map(toGoods).sort(byOrder);
}

export async function getOnrei(limit = 30) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "onrei");
  if (!fromNotion("onrei")) return mock.mockOnrei().slice(0, limit);
  return (await queryDatabase(DB.onrei, { filter: PUBLISHED, sorts: BY_DATE_DESC }, limit)).map(toOnrei);
}

export async function getMemberPhotos(memberId: string): Promise<Photo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "photos");
  if (!fromNotion("photos")) return mock.mockPhotos().filter((p) => p.athleteIds.includes(memberId));
  const pages = await queryDatabase(DB.photos, {
    filter: { and: [PUBLISHED, { property: "選手", relation: { contains: memberId } }] },
    sorts: BY_DATE_DESC,
  });
  return pages.map(toPhoto).filter((p): p is Photo => p !== null);
}

export async function getHeroPhotos(): Promise<Photo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG, "photos");
  if (!fromNotion("photos")) return mock.mockPhotos().filter((p) => p.hero);
  const pages = await queryDatabase(DB.photos, {
    filter: { and: [PUBLISHED, { property: "ヒーロー", checkbox: { equals: true } }] },
    sorts: BY_DATE_DESC,
  });
  return pages.map(toPhoto).filter((p): p is Photo => p !== null);
}

/* ───────── 画像URLの再発行（/api/img 用） ───────── */

/**
 * Notion にアップロードされたファイルの署名付きURLを取得する。
 * URL は約1時間で失効するので、30分で裏で再取得・50分で強制失効させる。
 * 公開DBの公開ページ・許可された列のファイルしか返さない。
 */
export async function getPageFileUrl(pageId: string, prop: string, index: number): Promise<string | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 1800, expire: 3000 });
  if (!isNotionConfigured()) return null;
  let page: NotionPage;
  try {
    page = await retrievePage(pageId);
  } catch {
    return null;
  }
  const allowedDbs = (Object.keys(PUBLIC_FILE_PROPS) as DbKey[]).filter((k) => PUBLIC_FILE_PROPS[k]?.includes(prop));
  if (!isPublicPageOf(page, allowedDbs)) return null;
  return fileUrl(files(page.properties, prop)[index]);
}

export async function getBlockFileUrl(blockId: string): Promise<string | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 1800, expire: 3000 });
  if (!isNotionConfigured()) return null;
  try {
    const block = await retrieveBlock(blockId);
    const data = block[block.type] as { type?: string; file?: { url: string }; external?: { url: string } } | undefined;
    const src = data?.type === "file" ? data.file?.url : data?.type === "external" ? data.external?.url : undefined;
    if (!src) return null;

    // 親をたどってページを見つけ、公開対象のページか確認する
    let parent = block.parent;
    for (let i = 0; i < 5 && parent.type === "block_id" && parent.block_id; i++) {
      parent = (await retrieveBlock(parent.block_id)).parent;
    }
    if (parent.type !== "page_id" || !parent.page_id) return null;
    const page = await retrievePage(parent.page_id);
    return isPublicPageOf(page, PUBLIC_BODY_DBS) ? src : null;
  } catch {
    return null;
  }
}
