// Notion ページ本文（ブロック）を表示する。コラムやお知らせの本文用。
// よく使うブロックのみ対応し、未対応のブロックは表示しない。

import type { ReactNode } from "react";
import type { NotionBlock, RichText } from "@/lib/notion/client";

function Rich({ text }: { text: RichText[] | undefined }) {
  return (
    <>
      {(text ?? []).map((t, i) => {
        const a = t.annotations ?? {};
        let node: ReactNode = t.plain_text;
        if (a.code) node = <code className="rounded bg-surface-2 px-1 text-[0.9em]">{node}</code>;
        if (a.bold) node = <strong>{node}</strong>;
        if (a.italic) node = <em>{node}</em>;
        if (a.strikethrough) node = <s>{node}</s>;
        if (a.underline) node = <u>{node}</u>;
        if (t.href)
          node = (
            <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-brand underline">
              {node}
            </a>
          );
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

type Media = { type?: string; file?: { url: string }; external?: { url: string }; caption?: RichText[] };

function mediaSrc(block: NotionBlock, data: Media): string | null {
  if (data.type === "external") return data.external?.url ?? null;
  if (data.type === "file") return `/api/img?block=${block.id}`;
  return null;
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function Block({ block }: { block: NotionBlock }) {
  const data = block[block.type] as { rich_text?: RichText[]; [k: string]: unknown };
  const children = block.children?.length ? <NotionBlocks blocks={block.children} /> : null;

  switch (block.type) {
    case "paragraph":
      return (
        <p className="min-h-[1em] leading-8">
          <Rich text={data.rich_text} />
          {children && <span className="block pl-4">{children}</span>}
        </p>
      );
    case "heading_1":
      return (
        <h2 className="mt-8 border-l-4 border-brand pl-3 text-xl font-bold">
          <Rich text={data.rich_text} />
        </h2>
      );
    case "heading_2":
      return (
        <h3 className="mt-6 text-lg font-bold">
          <Rich text={data.rich_text} />
        </h3>
      );
    case "heading_3":
      return (
        <h4 className="mt-4 font-bold">
          <Rich text={data.rich_text} />
        </h4>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-line pl-4 text-ink-2">
          <Rich text={data.rich_text} />
          {children}
        </blockquote>
      );
    case "callout":
      return (
        <div className="rounded-xl bg-surface-2 p-4">
          <Rich text={data.rich_text} />
          {children}
        </div>
      );
    case "divider":
      return <hr className="border-line" />;
    case "toggle":
      return (
        <details className="rounded-xl border border-line p-3">
          <summary className="cursor-pointer font-bold">
            <Rich text={data.rich_text} />
          </summary>
          <div className="mt-2">{children}</div>
        </details>
      );
    case "image": {
      const src = mediaSrc(block, data as Media);
      if (!src) return null;
      const caption = (data as Media).caption;
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" className="w-full rounded-xl" />
          {caption?.length ? (
            <figcaption className="mt-1 text-center text-xs text-ink-2">
              <Rich text={caption} />
            </figcaption>
          ) : null}
        </figure>
      );
    }
    case "video":
    case "embed":
    case "bookmark":
    case "link_preview": {
      const src = mediaSrc(block, data as Media) ?? (data.url as string | undefined) ?? null;
      if (!src) return null;
      const yt = youtubeId(src);
      if (yt) {
        return (
          <div className="aspect-video overflow-hidden rounded-xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${yt}`}
              title="YouTube"
              className="h-full w-full"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate rounded-xl border border-line p-3 text-sm text-brand"
        >
          🔗 {src}
        </a>
      );
    }
    case "column_list":
    case "column":
    case "synced_block":
      return children;
    default:
      return null;
  }
}

/** 連続するリスト項目を ul/ol にまとめて表示する */
export function NotionBlocks({ blocks }: { blocks: NotionBlock[] }) {
  const out: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      const type = b.type;
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === type) items.push(blocks[i++]);
      i--;
      const List = type === "bulleted_list_item" ? "ul" : "ol";
      out.push(
        <List key={b.id} className={`${List === "ul" ? "list-disc" : "list-decimal"} space-y-1 pl-6 leading-7`}>
          {items.map((it) => (
            <li key={it.id}>
              <Rich text={(it[type] as { rich_text?: RichText[] }).rich_text} />
              {it.children?.length ? <NotionBlocks blocks={it.children} /> : null}
            </li>
          ))}
        </List>,
      );
    } else {
      out.push(<Block key={b.id} block={b} />);
    }
  }
  return <div className="space-y-4">{out}</div>;
}
