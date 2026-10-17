import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/data";
import { formatDate } from "@/lib/time";
import { ShareButton } from "./client-utils";
import { NotionBlocks } from "./NotionBlocks";

export async function Article({ params, kind }: { params: Promise<{ id: string }>; kind: "columns" | "news" }) {
  const { id } = await params;
  const article = await getArticle(id, kind);
  if (!article) notFound();

  return (
    <article className="px-4 pt-6">
      <Link href="/news" className="text-sm text-brand">
        ← ニュース一覧
      </Link>
      <p className="mt-4 text-xs text-ink-2 tabular">{formatDate(article.date, true)}</p>
      <h1 className="mt-1 text-2xl font-bold leading-snug">{article.title}</h1>
      {article.summary && <p className="mt-2 text-sm text-ink-2">{article.summary}</p>}
      <div className="mt-6">
        <NotionBlocks blocks={article.blocks} />
      </div>
      <div className="mt-10 flex justify-center">
        <ShareButton title={article.title} />
      </div>
    </article>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-4 pt-10">
      <div className="h-4 w-24 rounded bg-surface-2" />
      <div className="h-8 w-3/4 rounded bg-surface-2" />
      <div className="h-40 rounded bg-surface-2" />
    </div>
  );
}
