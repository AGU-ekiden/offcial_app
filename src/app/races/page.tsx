import type { Metadata } from "next";
import Link from "next/link";
import { Card, Empty, KindTag, PageTitle } from "@/components/ui";
import { getSchedule } from "@/lib/data";
import { addDays, formatDateRange } from "@/lib/time";
import type { ScheduleItem } from "@/lib/types";
import { RaceTabs } from "./tabs";

export const metadata: Metadata = { title: "大会日程" };

function calendarUrl(s: ScheduleItem): string {
  const start = s.start.slice(0, 10).replace(/-/g, "");
  const end = addDays((s.end ?? s.start).slice(0, 10), 1).replace(/-/g, "");
  const qs = new URLSearchParams({
    action: "TEMPLATE",
    text: `${s.title}（青学 陸上競技部）`,
    dates: `${start}/${end}`,
    location: s.venue,
  });
  return `https://calendar.google.com/calendar/render?${qs}`;
}

export default async function RacesPage() {
  const schedule = await getSchedule();
  const months = new Map<string, ScheduleItem[]>();
  for (const s of schedule) {
    const key = s.start.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), s]);
  }

  return (
    <>
      <PageTitle title="RACES" sub="大会日程・結果" />
      <RaceTabs active="schedule" />

      {schedule.length === 0 && <Empty>現在予定されている大会はありません</Empty>}

      {[...months.entries()].map(([month, items]) => (
        <section key={month} className="mt-6">
          <h2 className="px-4 pb-2 font-display text-lg font-bold">
            {Number(month.slice(0, 4))}年 {Number(month.slice(5))}月
          </h2>
          <ul className="space-y-3 px-4">
            {items.map((s) => (
              <li key={s.id} id={s.id} className="scroll-mt-20">
                <Card className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-2">
                    <span className="font-bold text-ink">{formatDateRange(s.start, s.end)}</span>
                    <KindTag kind={s.kind} />
                    {s.target && <span>{s.target}</span>}
                  </div>
                  <h3 className="mt-2 font-bold leading-snug">{s.title}</h3>
                  {s.venue && <p className="mt-1 text-sm text-ink-2">📍 {s.venue}</p>}

                  {s.detail && !s.tbd && (
                    <details className="mt-3 rounded-xl bg-surface-2 p-3">
                      <summary className="cursor-pointer text-sm font-bold">出場予定選手・詳細</summary>
                      <p className="mt-2 text-sm leading-7 whitespace-pre-line">{s.detail}</p>
                    </details>
                  )}
                  {s.tbd && <p className="mt-3 text-xs text-ink-2">出場選手などの詳細は決まり次第お知らせします</p>}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={calendarUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-line px-3 py-1.5 text-xs font-bold"
                    >
                      📅 カレンダーに追加
                    </a>
                    {s.links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-brand"
                      >
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-8 px-4 text-center text-sm">
        <Link href="/races/results" className="font-bold text-brand">
          過去の大会結果を見る →
        </Link>
      </p>
    </>
  );
}
