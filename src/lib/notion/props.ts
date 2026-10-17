// Notion のプロパティ値を素直な JS の値に変換するヘルパー。
// 型が想定と違う・プロパティが無い場合は空値を返し、例外にはしない（DB の列変更でアプリが落ちないように）。

import type { NotionFile, NotionPage, NotionProperty, RichText } from "./client";

type Props = NotionPage["properties"];

function prop(props: Props, name: string): NotionProperty | undefined {
  return props[name];
}

export function richTextToPlain(rt: RichText[] | undefined): string {
  return (rt ?? []).map((t) => t.plain_text).join("");
}

export function text(props: Props, name: string): string {
  const p = prop(props, name);
  if (!p) return "";
  if (p.type === "title") return richTextToPlain(p.title as RichText[]).trim();
  if (p.type === "rich_text") return richTextToPlain(p.rich_text as RichText[]).trim();
  return "";
}

export function select(props: Props, name: string): string {
  const p = prop(props, name);
  if (p?.type !== "select") return "";
  return (p.select as { name: string } | null)?.name ?? "";
}

export type Tag = { name: string; color: string };

export function multiSelect(props: Props, name: string): Tag[] {
  const p = prop(props, name);
  if (p?.type !== "multi_select") return [];
  return (p.multi_select as Tag[]).map(({ name, color }) => ({ name, color }));
}

export function checkbox(props: Props, name: string): boolean {
  const p = prop(props, name);
  return p?.type === "checkbox" ? Boolean(p.checkbox) : false;
}

export function number(props: Props, name: string): number | null {
  const p = prop(props, name);
  return p?.type === "number" ? ((p.number as number | null) ?? null) : null;
}

export function url(props: Props, name: string): string {
  const p = prop(props, name);
  return p?.type === "url" ? ((p.url as string | null) ?? "") : "";
}

export function date(props: Props, name: string): { start: string; end: string | null } | null {
  const p = prop(props, name);
  if (p?.type !== "date") return null;
  return (p.date as { start: string; end: string | null } | null) ?? null;
}

export function relationIds(props: Props, name: string): string[] {
  const p = prop(props, name);
  if (p?.type !== "relation") return [];
  return (p.relation as { id: string }[]).map((r) => r.id);
}

export function files(props: Props, name: string): NotionFile[] {
  const p = prop(props, name);
  return p?.type === "files" ? (p.files as NotionFile[]) : [];
}

/**
 * 画像の表示用URLを返す。
 * 外部URLはそのまま、Notion にアップロードされたファイルは約1時間で期限切れになるため
 * /api/img 経由で都度新しい署名付きURLへリダイレクトさせる。
 */
export function imageSrc(page: NotionPage, name: string, index = 0): string | null {
  const f = files(page.properties, name)[index];
  if (!f) return null;
  if (f.type === "external") return f.external.url;
  const qs = new URLSearchParams({ page: page.id, prop: name, i: String(index) });
  return `/api/img?${qs}`;
}

export function fileUrl(f: NotionFile | undefined): string | null {
  if (!f) return null;
  return f.type === "external" ? f.external.url : f.file.url;
}
