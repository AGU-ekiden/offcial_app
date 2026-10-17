import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getNendoList } from "@/lib/data";
import { ResultsView } from "../view";

export async function generateStaticParams() {
  const years = await getNendoList();
  return years.slice(0, 4).map((y) => ({ nendo: String(y) }));
}

export async function generateMetadata({ params }: PageProps<"/races/results/[nendo]">) {
  const { nendo } = await params;
  return { title: `${nendo}年度 大会結果` };
}

async function NendoResults({ params }: Pick<PageProps<"/races/results/[nendo]">, "params">) {
  const { nendo } = await params;
  const year = Number(nendo);
  const years = await getNendoList();
  if (!Number.isInteger(year) || !years.includes(year)) notFound();
  return <ResultsView nendo={year} />;
}

export default function NendoResultsPage({ params }: PageProps<"/races/results/[nendo]">) {
  return (
    <Suspense fallback={<div className="mx-4 mt-10 h-40 animate-pulse rounded-2xl bg-surface-2" />}>
      <NendoResults params={params} />
    </Suspense>
  );
}
