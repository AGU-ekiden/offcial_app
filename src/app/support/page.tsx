import type { Metadata } from "next";
import { ShareButton } from "@/components/client-utils";
import { Card, Empty, PageTitle, Section } from "@/components/ui";
import { SITE } from "@/lib/config";
import { getGoods, getOnrei, getSponsors } from "@/lib/data";
import { formatDate } from "@/lib/time";
import type { Sponsor } from "@/lib/types";

export const metadata: Metadata = { title: "応援する" };

function SponsorGrid({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-3">
      {sponsors.map((s) => {
        const body = (
          <Card className="flex h-20 items-center justify-center p-3">
            {s.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.logo} alt={s.name} loading="lazy" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-center text-sm font-bold">{s.name}</span>
            )}
          </Card>
        );
        return (
          <li key={s.id}>
            {s.link ? (
              <a href={s.link} target="_blank" rel="noopener noreferrer">
                {body}
              </a>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default async function SupportPage() {
  const [goods, sponsors, onrei] = await Promise.all([getGoods(), getSponsors(), getOnrei(12)]);
  const teams = [...new Set(sponsors.map((s) => s.team || "共通"))];

  return (
    <>
      <PageTitle title="SUPPORT" sub="チームを応援する" />

      <div className="mx-4 mt-2 rounded-2xl bg-brand-deep p-5 text-white">
        <p className="font-bold">アプリをシェアして応援の輪を広げよう</p>
        <p className="mt-1 text-sm opacity-80">結果や選手情報をいつでもチェックできます。</p>
        <div className="mt-4 flex flex-wrap gap-2 text-ink">
          <ShareButton title={SITE.name} text="青学陸上競技部の公式アプリ" />
          {SITE.sns.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-white"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <Section title="オフィシャルグッズ">
        {goods.length === 0 ? (
          <Empty>グッズ情報は準備中です</Empty>
        ) : (
          <ul className="grid grid-cols-2 gap-3 px-4">
            {goods.map((g) => {
              const card = (
                <Card className="h-full overflow-hidden">
                  <div className="relative aspect-square bg-surface-2">
                    {g.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.photo} alt={g.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-ink-2">GOODS</div>
                    )}
                    {g.isNew && (
                      <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-black">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="p-3 text-sm font-bold">{g.name}</p>
                </Card>
              );
              return (
                <li key={g.id}>
                  {g.url ? (
                    <a href={g.url} target="_blank" rel="noopener noreferrer">
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {teams.map((team) => (
        <Section key={team} title={teams.length > 1 ? `スポンサー（${team}）` : "スポンサー"}>
          <SponsorGrid sponsors={sponsors.filter((s) => (s.team || "共通") === team)} />
        </Section>
      ))}

      <Section title="御礼" linkLabel="">
        <p className="mb-3 px-4 text-sm text-ink-2">差し入れ・ご支援をいただいた皆さま、本当にありがとうございます。</p>
        {onrei.length === 0 ? (
          <Empty>まだ掲載はありません</Empty>
        ) : (
          <ul className="space-y-3 px-4">
            {onrei.map((o) => (
              <li key={o.id}>
                <Card className="overflow-hidden">
                  {o.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.photo} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  )}
                  <div className="p-4">
                    <p className="text-xs text-ink-2 tabular">{formatDate(o.date)}</p>
                    <p className="mt-1 font-bold">{o.donor}</p>
                    {o.item && <p className="text-sm text-ink-2">{o.item}</p>}
                    {o.message && <p className="mt-2 text-sm leading-relaxed">{o.message}</p>}
                    {o.inPhoto && <p className="mt-2 text-xs text-ink-2">写真：{o.inPhoto}</p>}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <p className="mt-10 px-4 text-center text-xs text-ink-2">
        <a href={SITE.officialSite} target="_blank" rel="noopener noreferrer" className="underline">
          公式サイト
        </a>
      </p>
    </>
  );
}
