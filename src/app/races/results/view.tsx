import Link from "next/link";
import { MeetCard, TeamResultLine } from "@/components/results";
import { Card, Empty, PageTitle } from "@/components/ui";
import { attachTeamResults, getMemberNames, getNendoList, getResultsByNendo, getTeamResultsByNendo } from "@/lib/data";
import { RaceTabs } from "../tabs";

export async function ResultsView({ nendo }: { nendo: number }) {
  const [meets, names, years, teams] = await Promise.all([
    getResultsByNendo(nendo),
    getMemberNames(),
    getNendoList(),
    getTeamResultsByNendo(nendo),
  ]);
  const { byMeet, unmatched } = attachTeamResults(meets, teams);

  return (
    <>
      <PageTitle title="RESULTS" sub={`${nendo}年度の大会結果`} />
      <RaceTabs active="results" />

      <nav className="scrollbar-none mt-4 flex gap-2 overflow-x-auto px-4" aria-label="年度">
        {years.map((y) => (
          <Link
            key={y}
            href={y === years[0] ? "/races/results" : `/races/results/${y}`}
            aria-current={y === nendo ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium tabular ${
              y === nendo ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface"
            }`}
          >
            {y}年度
          </Link>
        ))}
      </nav>

      {unmatched.length > 0 && (
        <section className="mt-4 px-4">
          <h2 className="pb-2 text-sm font-bold text-ink-2">チーム成績</h2>
          <Card className="divide-y divide-line">
            {unmatched.map((t) => (
              <div key={t.id} className="px-4 py-3">
                <TeamResultLine team={t} showMeet />
              </div>
            ))}
          </Card>
        </section>
      )}

      <div className="mt-4 space-y-3 px-4">
        {meets.length === 0 ? (
          <Empty>{nendo}年度の個人結果はまだありません</Empty>
        ) : (
          meets.map((m) => <MeetCard key={m.key} meet={m} names={names} teams={byMeet[m.key]} />)
        )}
      </div>
    </>
  );
}
