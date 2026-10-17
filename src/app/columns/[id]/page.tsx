import { Suspense } from "react";
import { atLeastOne } from "@/lib/static-params";
import { Article, ArticleSkeleton } from "@/components/Article";
import { getColumns } from "@/lib/data";

export async function generateStaticParams() {
  const columns = await getColumns(20);
  return atLeastOne(columns.map((c) => ({ id: c.id })));
}

export default function ColumnPage({ params }: PageProps<"/columns/[id]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <Article params={params} kind="columns" />
    </Suspense>
  );
}
