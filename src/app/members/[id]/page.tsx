import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { atLeastOne } from "@/lib/static-params";
import { ShareButton } from "@/components/client-utils";
import { FavoriteButton } from "@/components/favorites";
import { isHighlight } from "@/components/results";
import { Avatar, Badge, Card, Empty, Section } from "@/components/ui";
import { getHsBests, getMember, getMemberPhotos, getMemberResults, getMembers, personalBests } from "@/lib/data";
import { formatDate, parseTime } from "@/lib/time";
import type { HsBest, PersonalBest } from "@/lib/types";

export async function generateStaticParams() {
  const members = await getMembers();
  return atLeastOne(members.map((m) => ({ id: m.id })));
}

export async function generateMetadata({ params }: PageProps<"/members/[id]">) {
  const { id } = await params;
  const m = await getMember(id);
  return { title: m ? m.name : "選手" };
}

function Info({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-2 text-sm">
      <dt className="w-20 shrink-0 text-ink-2">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

async function MemberProfile({ params }: Pick<PageProps<"/members/[id]">, "params">) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();

  const [results, photos, hsBests] = await Promise.all([
    getMemberResults(member.id),
    getMemberPhotos(member.id),
    getHsBests(member.id),
  ]);
  const bests = mergeBests(personalBests(results), hsBests);
  const isPlayer = member.role === "選手";

  return (
    <>
      <div className="bg-brand-deep px-4 pt-6 pb-6 text-white">
        <Link href="/members" className="text-sm opacity-80">
          ← 選手名鑑
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <Avatar src={member.photo} name={member.name} size={96} />
          <div className="min-w-0">
            <p className="text-xs opacity-80">
              {[member.grade, member.position || (isPlayer ? "" : member.role)].filter(Boolean).join(" ・ ")}
            </p>
            <h1 className="text-2xl font-bold">{member.name}</h1>
            {member.nameRoman && <p className="font-display text-sm tracking-wider opacity-80">{member.nameRoman}</p>}
          </div>
        </div>
        {member.comment && <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm leading-relaxed">“{member.comment}”</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-ink">
          <FavoriteButton id={member.id} name={member.name} />
          <ShareButton title={`${member.name} | AGU EKIDEN`} />
        </div>
      </div>

      {isPlayer && (
        <Section title="自己ベスト">
          {bests.length === 0 ? (
            <Empty>記録はまだ登録されていません</Empty>
          ) : (
            <ul className="grid grid-cols-2 gap-2 px-4">
              {bests.map(({ event, pb, hs }) => {
                const diff = pb && hs ? improvement(pb.time, hs.time) : null;
                return (
                  <li key={event}>
                    <Card className="h-full p-3">
                      <p className="text-xs font-bold text-ink-2">{event}</p>
                      {pb ? (
                        <>
                          <p className="font-display text-2xl font-semibold tabular">{pb.time}</p>
                          <p className="mt-1 line-clamp-1 text-[11px] text-ink-2">
                            {formatDate(pb.date)} {pb.meet}
                          </p>
                        </>
                      ) : (
                        <p className="py-1 text-xs text-ink-2">大学での記録なし</p>
                      )}
                      {hs && (
                        <p className="mt-2 border-t border-line pt-2 text-[11px] text-ink-2">
                          高校 <span className="font-bold text-ink tabular">{hs.time}</span>
                          {diff && <span className="ml-1 font-bold text-brand">{diff}</span>}
                        </p>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      )}

      <Section title="プロフィール">
        <Card className="mx-4 px-4">
          <dl className="divide-y divide-line">
            <Info label="学年" value={member.grade} />
            <Info label="学部" value={member.faculty} />
            <Info label="出身高校" value={member.highSchool} />
            <Info label="主な実績" value={member.achievements} />
          </dl>
        </Card>
      </Section>

      {photos.length > 0 && (
        <Section title="フォト">
          <ul className="grid grid-cols-3 gap-1 px-4">
            {photos.map((p) => (
              <li key={p.id} className="aspect-square overflow-hidden rounded-lg bg-surface-2">
                <a href={p.src} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {isPlayer && results.length > 0 && (
        <Section title="競技成績">
          <Card className="mx-4 divide-y divide-line">
            {results.slice(0, 50).map((r) => (
              <div key={r.id} className={`flex items-center gap-3 px-4 py-3 ${isHighlight(r) ? "bg-accent/10" : ""}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-ink-2 tabular">{formatDate(r.date)}</p>
                  <p className="line-clamp-1 text-sm font-bold">{r.meet}</p>
                  <p className="text-xs text-ink-2">
                    {r.kind === "駅伝" ? `${r.section ?? ""}区${r.distance ? ` (${r.distance}km)` : ""}` : r.eventLabel}
                    {r.heat && ` ${r.heat}`}
                  </p>
                  {r.flags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.flags.map((f) => (
                        <Badge key={f.name} tag={f} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-semibold tabular">{r.time || "—"}</p>
                  {r.rank !== null && <p className="text-[11px] text-ink-2">{r.rank}位</p>}
                </div>
              </div>
            ))}
          </Card>
        </Section>
      )}
    </>
  );
}

const EVENT_ORDER = ["800m", "1500m", "3000m", "3000mSC", "5000m", "10000m", "ハーフマラソン", "マラソン"];

/** 大学の自己ベスト（競技結果DBから算出）と高校の自己ベスト（高校自己ベストDB）を種目ごとに並べる */
function mergeBests(pbs: PersonalBest[], hsBests: HsBest[]) {
  const events = new Map<string, { event: string; pb?: PersonalBest; hs?: HsBest }>();
  for (const pb of pbs) events.set(pb.event, { event: pb.event, pb });
  for (const hs of hsBests) {
    const event = hs.event === "フルマラソン" ? "マラソン" : hs.event;
    if (!event) continue;
    const cur = events.get(event) ?? { event };
    // 同じ種目が複数行ある場合は速い方を採用
    const sec = parseTime(hs.time);
    const curSec = cur.hs ? parseTime(cur.hs.time) : null;
    if (!cur.hs || (sec !== null && (curSec === null || sec < curSec))) cur.hs = hs;
    events.set(event, cur);
  }
  const rank = (e: string) => (EVENT_ORDER.includes(e) ? EVENT_ORDER.indexOf(e) : 99);
  return [...events.values()].sort((a, b) => rank(a.event) - rank(b.event));
}

/** 高校ベストから何秒縮めたか（"−16.9秒" / "−1分02秒"） */
function improvement(univ: string, hs: string): string | null {
  const a = parseTime(univ);
  const b = parseTime(hs);
  if (a === null || b === null || a >= b) return null;
  const d = b - a;
  if (d < 60) return `−${d.toFixed(d < 10 ? 2 : 1)}秒`;
  const total = Math.round(d);
  return `−${Math.floor(total / 60)}分${String(total % 60).padStart(2, "0")}秒`;
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-56 bg-brand-deep" />
      <div className="mx-4 mt-6 h-24 rounded-2xl bg-surface-2" />
    </div>
  );
}

export default function MemberPage({ params }: PageProps<"/members/[id]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <MemberProfile params={params} />
    </Suspense>
  );
}
