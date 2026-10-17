import Link from "next/link";
import type { ReactNode } from "react";
import type { Tag } from "@/lib/types";

export function Section({
  title,
  href,
  linkLabel = "すべて見る",
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between px-4">
        <h2 className="font-display text-xl font-bold tracking-wide">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-medium text-brand">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-4 pt-6 pb-2">
      <h1 className="font-display text-2xl font-bold tracking-wide">{title}</h1>
      {sub && <p className="mt-1 text-sm text-ink-2">{sub}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="mx-4 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-2">{children}</p>;
}

// Notion のセレクト色をバッジ色に対応させる
const NOTION_COLORS: Record<string, string> = {
  red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  brown: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  gray: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  default: "bg-surface-2 text-ink-2",
};

export function Badge({ tag }: { tag: Tag }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold leading-4 ${NOTION_COLORS[tag.color] ?? NOTION_COLORS.default}`}
    >
      {tag.name}
    </span>
  );
}

const NEWS_TAG_COLORS: Record<string, string> = { 結果: "yellow", 予定: "blue", 御礼: "red", お知らせ: "pink", コラム: "green" };

export function NewsTag({ name }: { name: string }) {
  if (!name) return null;
  return <Badge tag={{ name, color: NEWS_TAG_COLORS[name] ?? "default" }} />;
}

const KIND_COLORS: Record<string, string> = { トラック: "orange", ロード: "gray", 駅伝: "green" };

export function KindTag({ kind }: { kind: string }) {
  if (!kind) return null;
  return <Badge tag={{ name: kind, color: KIND_COLORS[kind] ?? "default" }} />;
}

/** 写真がなければ名前の頭文字を表示する */
export function Avatar({ src, name, size = 56 }: { src: string | null; name: string; size?: number }) {
  const initial = name.replace(/\s/g, "").slice(0, 1);
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-brand-deep text-white"
      style={{ width: size, height: size }}
    >
      {src ? (
        // Notion 画像は /api/img 経由のリダイレクトなので next/image の最適化は使わない
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-bold" style={{ fontSize: size * 0.4 }}>
          {initial}
        </span>
      )}
    </div>
  );
}
