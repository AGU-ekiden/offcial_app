import type { Metadata } from "next";
import { getNendoList } from "@/lib/data";
import { ResultsView } from "./view";

export const metadata: Metadata = { title: "大会結果" };

export default async function CurrentResultsPage() {
  const [current] = await getNendoList();
  return <ResultsView nendo={current} />;
}
