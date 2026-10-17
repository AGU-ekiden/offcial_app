import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { FavoriteStrip } from "@/components/favorites";
import { InstallBanner } from "@/components/client-utils";
import { MeetCard } from "@/components/results";
import { Card, Empty, KindTag, NewsTag, Section } from "@/components/ui";
import { getHeroPhotos, getMemberNames, getMembers, getNews, getRecentMeets, getSchedule, getSponsors } from "@/lib/data";
import { formatDate, formatDateRange } from "@/lib/time";
import { newsHref } from "./news/href";

export default async function Home() {
  const [schedule, news, meets, names, members, sponsors, heroes] = await Promise.all([
    getSchedule(),
    getNews(5),
    getRecentMeets(2),
    getMemberNames(),
    getMembers(),
    getSponsors(),
    getHeroPhotos(),
  ]);
  const next = schedule[0];
  const hero = heroes[0];

  return (
    <>
      {/* ヒーロー: 次の大会 */}
      <div className="relative overflow-hidden bg-brand-deep px-4 pt-6 pb-8 text-white">
        {hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        )}
        <div className="relative">
          <p className="font-display text-xs tracking-[0.3em] opacity-80">NEXT RACE</p>
          {next ? (
            <Link href={`/races#${next.id}`} className="mt-2 block">
              <div className="flex items-end justify-between gap-4">
                <h1 className="text-xl font-bold leading-snug">{next.title}</h1>
                <div className="shrink-0 text-accent">
                  <Countdown date={next.start} />
                </div>
              </div>
              <p className="mt-2 text-sm opacity-90">
                {formatDateRange(next.start, next.end)}
                {next.venue && ` ・ ${next.venue}`}
              </p>
            </Link>
          ) : (
            <p className="mt-2 text-lg font-bold">現在予定されている大会はありません</p>
          )}
        </div>
      </div>

      <InstallBanner />

      <Section title="ニュース" href="/news">
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
                  </div>
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                </Link>
              );
            })}
          </Card>
        )}
      </Section>

      <Section title="推し選手" href="/members" linkLabel="選手名鑑">
        <FavoriteStrip members={members} />
      </Section>

      <Section title="最新の結果" href="/races/results">
        {meets.length === 0 ? (
          <Empty>結果はまだありません</Empty>
        ) : (
          <div className="space-y-3 px-4">
            {meets.map((m) => (
              <MeetCard key={m.key} meet={m} names={names} compact />
            ))}
          </div>
        )}
      </Section>

      {schedule.length > 1 && (
        <Section title="今後の大会" href="/races">
          <ul className="scrollbar-none flex gap-3 overflow-x-auto px-4">
            {schedule.slice(1, 6).map((s) => (
              <li key={s.id} className="w-60 shrink-0">
                <Link href={`/races#${s.id}`}>
                  <Card className="h-full p-4">
                    <div className="flex items-center gap-2 text-xs text-ink-2">
                      <span>{formatDateRange(s.start, s.end)}</span>
                      <KindTag kind={s.kind} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-bold">{s.title}</p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {sponsors.length > 0 && (
        <Section title="SPONSORS" href="/support" linkLabel="応援する">
          <ul className="grid grid-cols-3 gap-2 px-4">
            {sponsors
              .filter((s) => s.main)
              .map((s) => (
                <li key={s.id}>
                  <Card className="flex h-16 items-center justify-center p-2">
                    {s.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo} alt={s.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-center text-xs font-bold">{s.name}</span>
                    )}
                  </Card>
                </li>
              ))}
          </ul>
        </Section>
      )}
    </>
  );
}
