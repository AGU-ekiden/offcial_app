import type { Metadata } from "next";
import { Card, Empty, PageTitle } from "@/components/ui";
import { getEkidenRecords } from "@/lib/data";
import { RaceTabs } from "../tabs";

export const metadata: Metadata = { title: "三大駅伝 青学記録" };

const TEAM_SECTIONS = new Set(["往路", "復路", "総合結果"]);

export default async function RecordsPage() {
  const races = await getEkidenRecords();

  return (
    <>
      <PageTitle title="RECORDS" sub="三大駅伝の区間別 青学記録" />
      <RaceTabs active="records" />

      {races.length === 0 && (
        <div className="mt-6">
          <Empty>記録はまだ登録されていません</Empty>
        </div>
      )}

      {races.map(({ race, records }) => {
        const team = records.filter((r) => TEAM_SECTIONS.has(r.section));
        const sections = records.filter((r) => !TEAM_SECTIONS.has(r.section));
        return (
          <section key={race} id={race} className="mt-8 scroll-mt-20">
            <h2 className="px-4 pb-3 font-display text-xl font-bold">{race}</h2>

            {team.length > 0 && (
              <ul className={`grid gap-2 px-4 ${team.length > 1 ? "grid-cols-3" : "grid-cols-1"}`}>
                {team.map((r) => (
                  <li key={r.id}>
                    <div className="h-full rounded-2xl bg-brand-deep p-3 text-white">
                      <p className="text-[11px] font-bold opacity-80">{r.section === "総合結果" ? "総合" : r.section}</p>
                      <p className="font-display text-xl font-bold tabular">{r.time}</p>
                      <p className="mt-0.5 text-[10px] opacity-70">{r.edition}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {sections.length > 0 && (
              <Card className="mx-4 mt-3 divide-y divide-line">
                {sections.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 shrink-0 text-center">
                      <p className="font-display text-lg font-bold">{r.section}</p>
                      {r.distance !== null && <p className="text-[10px] text-ink-2 tabular">{r.distance}km</p>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">
                        {r.athlete}
                        {r.grade !== null && <span className="ml-1 text-xs font-normal text-ink-2">({r.grade}年)</span>}
                      </p>
                      <p className="text-[11px] text-ink-2">{r.edition}</p>
                    </div>
                    <p className="font-display text-lg font-semibold tabular">{r.time}</p>
                  </div>
                ))}
              </Card>
            )}
          </section>
        );
      })}
    </>
  );
}
