import type { Metadata } from "next";
import Link from "next/link";
import { Card, Empty, NewsTag, PageTitle, Section } from "@/components/ui";
import { getColumns, getNews } from "@/lib/data";
import { formatDate } from "@/lib/time";
import { newsHref } from "./href";

export const metadata: Metadata = { title: "ニュース" };

export default async function NewsPage() {
  const [news, columns] = await Promise.all([getNews(40), getColumns(20)]);

  return (
    <>
      <PageTitle title="NEWS" sub="お知らせ・コラム" />

      {columns.length > 0 && (
        <Section title="コラム">
          <ul className="scrollbar-none flex gap-3 overflow-x-auto px-4">
            {columns.map((c) => (
              <li key={c.id} className="w-64 shrink-0">
                <Link href={`/columns/${c.id}`}>
                  <Card className="h-full overflow-hidden">
                    <div className="aspect-[16/9] bg-brand-deep">
                      {c.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center font-display text-2xl tracking-widest text-white/70">
                          COLUMN
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-ink-2 tabular">{formatDate(c.date)}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-bold">{c.title}</p>
                      {c.summary && <p className="mt-1 line-clamp-2 text-xs text-ink-2">{c.summary}</p>}
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="お知らせ">
        {news.length === 0 ? (
          <Empty>お知らせはまだありません</Empty>
        ) : (
          <Card className="mx-4 divide-y divide-line">
            {news.map((n) => {
              const { href, external } = newsHref(n);
              return (
                <Link
                  key={n.id}
                  href={href}
                  target={external ? "_blank" : undefined}
                  className="flex flex-col gap-1 px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-xs text-ink-2">
                    <span className="tabular">{formatDate(n.date)}</span>
                    <NewsTag name={n.tag} />
                    {external && <span aria-label="外部リンク">↗</span>}
                  </div>
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                </Link>
              );
            })}
          </Card>
        )}
      </Section>
    </>
  );
}
