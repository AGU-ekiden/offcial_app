import { Suspense } from "react";
import { atLeastOne } from "@/lib/static-params";
import { Article, ArticleSkeleton } from "@/components/Article";
import { getNews } from "@/lib/data";

export async function generateStaticParams() {
  const news = await getNews(20);
  return atLeastOne(news.map((n) => ({ id: n.id })));
}

export default function NewsArticlePage({ params }: PageProps<"/news/[id]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <Article params={params} kind="news" />
    </Suspense>
  );
}
