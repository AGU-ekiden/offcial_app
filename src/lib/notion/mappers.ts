// Notion のページを アプリのドメイン型に変換する。
// 列名は Notion 側の DB（公式サイト管理用DB）に合わせている。列名を変えた場合はここを直す。

import type { NotionPage } from "./client";
import { checkbox, date, imageSrc, multiSelect, number, relationIds, select, text, url } from "./props";
import type {
  Column,
  EkidenRecord,
  Goods,
  HsBest,
  Member,
  MemberName,
  News,
  Onrei,
  Photo,
  Result,
  ScheduleItem,
  Sponsor,
  TeamResult,
} from "../types";

export function toNews(p: NotionPage): News {
  const P = p.properties;
  return {
    id: p.id,
    title: text(P, "タイトル"),
    date: date(P, "日付")?.start ?? null,
    tag: select(P, "タグ"),
    link: url(P, "リンク"),
    scheduleIds: relationIds(P, "大会予定"),
    resultIds: relationIds(P, "大会結果"),
  };
}

export function toColumn(p: NotionPage): Column {
  const P = p.properties;
  return {
    id: p.id,
    title: text(P, "タイトル"),
    date: date(P, "日付")?.start ?? null,
    summary: text(P, "概要"),
    thumbnail: imageSrc(p, "サムネイル"),
  };
}

export function toMember(p: NotionPage): Member {
  const P = p.properties;
  return {
    id: p.id,
    name: text(P, "氏名"),
    nameRoman: text(P, "氏名(ローマ字)"),
    grade: select(P, "学年"),
    gender: select(P, "性別"),
    role: select(P, "区分"),
    position: text(P, "役職"),
    highSchool: text(P, "出身高校"),
    faculty: select(P, "学部"),
    comment: text(P, "コメント"),
    achievements: text(P, "主な実績"),
    photo: imageSrc(p, "写真"),
    order: number(P, "掲載順"),
  };
}

export function toMemberName(p: NotionPage): MemberName {
  return { id: p.id, name: text(p.properties, "氏名"), grade: select(p.properties, "学年") };
}

export function toSchedule(p: NotionPage): ScheduleItem {
  const P = p.properties;
  const d = date(P, "日付");
  const links = [
    { label: text(P, "リンク１の名前") || "大会情報", url: url(P, "リンク１") },
    { label: text(P, "リンク２の名前") || "関連リンク", url: url(P, "リンク2") },
    { label: "関連リンク", url: url(P, "リンク3") },
    { label: "関連リンク", url: url(P, "リンク4") },
  ].filter((l) => l.url);
  return {
    id: p.id,
    title: text(P, "大会名"),
    start: d?.start ?? "",
    end: d?.end ?? null,
    venue: text(P, "会場"),
    kind: select(P, "種別"),
    target: select(P, "対象"),
    detail: text(P, "詳細"),
    tbd: checkbox(P, "詳細未定"),
    links,
  };
}

export function toResult(p: NotionPage): Result {
  const P = p.properties;
  return {
    id: p.id,
    meet: text(P, "大会名"),
    date: date(P, "日付")?.start ?? "",
    venue: text(P, "会場"),
    kind: select(P, "種別"),
    eventClass: select(P, "種目（分類）"),
    eventLabel: select(P, "種目（表示）") || select(P, "種目（分類）"),
    heat: text(P, "組"),
    section: number(P, "区間"),
    distance: number(P, "距離"),
    gender: select(P, "性別"),
    athleteId: relationIds(P, "選手名")[0] ?? null,
    rank: number(P, "順位"),
    time: text(P, "記録"),
    flags: multiSelect(P, "フラグ"),
    note: text(P, "備考"),
  };
}

export function toSponsor(p: NotionPage): Sponsor {
  const P = p.properties;
  return {
    id: p.id,
    name: text(P, "企業名"),
    team: select(P, "チーム"),
    main: checkbox(P, "メインスポンサー"),
    sub: checkbox(P, "サブスポンサー"),
    link: url(P, "リンク"),
    logo: imageSrc(p, "ロゴ画像"),
    order: number(P, "表示順"),
  };
}

export function toGoods(p: NotionPage): Goods {
  const P = p.properties;
  return {
    id: p.id,
    name: text(P, "商品名"),
    url: url(P, "URL"),
    photo: imageSrc(p, "写真"),
    isNew: checkbox(P, "NEW"),
    order: number(P, "表示順"),
  };
}

export function toOnrei(p: NotionPage): Onrei {
  const P = p.properties;
  return {
    id: p.id,
    donor: text(P, "提供者名"),
    date: date(P, "日付")?.start ?? null,
    item: text(P, "差し入れ品"),
    message: text(P, "メッセージ"),
    inPhoto: text(P, "写真に写っている選手"),
    photo: imageSrc(p, "写真"),
  };
}

export function toPhoto(p: NotionPage): Photo | null {
  const P = p.properties;
  const src = imageSrc(p, "写真");
  if (!src) return null;
  return {
    id: p.id,
    title: text(P, "写真名"),
    date: date(P, "日付")?.start ?? null,
    src,
    athleteIds: relationIds(P, "選手"),
    hero: checkbox(P, "ヒーロー"),
    note: text(P, "備考"),
  };
}

export function toHsBest(p: NotionPage): HsBest {
  const P = p.properties;
  return {
    id: p.id,
    athleteId: relationIds(P, "選手")[0] ?? null,
    event: select(P, "種目（分類）") || select(P, "種目"),
    time: text(P, "記録"),
    memo: text(P, "メモ"),
  };
}

export function toTeamResult(p: NotionPage): TeamResult {
  const P = p.properties;
  return {
    id: p.id,
    meet: text(P, "大会名"),
    date: date(P, "日付")?.start ?? "",
    division: select(P, "区分"),
    gender: select(P, "性別"),
    rank: number(P, "順位"),
    time: text(P, "記録"),
    flags: multiSelect(P, "フラグ"),
    note: text(P, "備考"),
    resultIds: relationIds(P, "大会結果"),
  };
}

export function toEkidenRecord(p: NotionPage): EkidenRecord {
  const P = p.properties;
  return {
    id: p.id,
    race: select(P, "大会名"),
    section: select(P, "区間"),
    athlete: text(P, "選手名"),
    grade: number(P, "学年"),
    distance: number(P, "距離"),
    time: text(P, "区間記録"),
    edition: text(P, "大会開催数（大会年度）"),
  };
}
