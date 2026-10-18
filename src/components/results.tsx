import Link from "next/link";
import { formatDate } from "@/lib/time";
import type { Meet, MemberName, Result, TeamResult } from "@/lib/types";
import { Badge, Card, KindTag } from "./ui";

// 目立たせたいフラグ（PB・区間賞・入賞など）
const HIGHLIGHT = /PB|区間賞|区間新|優勝|入賞|大会新|新記録|日本人1位|MVP/;

export function isHighlight(r: Result) {
  return r.flags.some((f) => HIGHLIGHT.test(f.name));
}

function AthleteName({ r, names }: { r: Result; names: Record<string, MemberName> }) {
  const m = r.athleteId ? names[r.athleteId] : undefined;
  if (!m) return <span className="text-ink-2">—</span>;
  return (
    <Link href={`/members/${m.id}`} className="font-bold hover:text-brand">
      {m.name}
      {m.grade && <span className="ml-1 text-[11px] font-normal text-ink-2">({m.grade.replace("年", "")})</span>}
    </Link>
  );
}

function ResultRow({ r, names }: { r: Result; names: Record<string, MemberName> }) {
  const ekiden = r.kind === "駅伝";
  return (
    <li className={`flex items-center gap-3 px-4 py-2.5 ${isHighlight(r) ? "bg-accent/10" : ""}`}>
      <span className="w-12 shrink-0 text-xs text-ink-2">
        {ekiden ? (r.section ? `${r.section}区` : "") : r.heat}
        {ekiden && r.distance ? <span className="block">{r.distance}km</span> : null}
      </span>
      <div className="min-w-0 flex-1">
        <AthleteName r={r} names={names} />
        {r.flags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {r.flags.map((f) => (
              <Badge key={f.name} tag={f} />
            ))}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="font-display text-lg font-semibold tabular">{r.time || "—"}</div>
        {r.rank !== null && <div className="text-[11px] text-ink-2">{ekiden ? `区間${r.rank}位` : `${r.rank}位`}</div>}
      </div>
    </li>
  );
}

/** チーム成績（総合・往路・復路）の1行 */
export function TeamResultLine({ team, showMeet = false }: { team: TeamResult; showMeet?: boolean }) {
  const label = team.division && team.division !== "総合" ? team.division : "総合";
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        {showMeet ? (
          <>
            <p className="text-[11px] text-ink-2 tabular">{formatDate(team.date, true)}</p>
            <p className="line-clamp-2 text-sm font-bold">{team.meet}</p>
          </>
        ) : (
          <p className="text-xs font-bold">チーム{label}</p>
        )}
        {team.flags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {team.flags.map((f) => (
              <Badge key={f.name} tag={f} />
            ))}
          </div>
        )}
      </div>
      <div className="text-right">
        <p className="font-display text-xl font-bold tabular">
          {team.rank !== null ? (
            <>
              {team.rank}
              <span className="text-xs font-normal">位</span>
            </>
          ) : (
            "—"
          )}
        </p>
        <p className="text-xs text-ink-2 tabular">{team.time}</p>
      </div>
    </div>
  );
}

export function MeetCard({
  meet,
  names,
  teams = [],
  compact = false,
}: {
  meet: Meet;
  names: Record<string, MemberName>;
  teams?: TeamResult[];
  compact?: boolean;
}) {
  const highlights = meet.results.filter(isHighlight);
  const results = compact ? (highlights.length ? highlights : meet.results).slice(0, 3) : meet.results;
  const events = [...new Set(results.map((r) => (r.kind === "駅伝" ? "" : r.eventLabel)))];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-ink-2">
          <span className="tabular">{formatDate(meet.date, true)}</span>
          <KindTag kind={meet.kind} />
        </div>
        <h3 className="mt-1 font-bold leading-snug">{meet.name}</h3>
        {meet.venue && <p className="text-xs text-ink-2">{meet.venue}</p>}
      </div>
      {teams.length > 0 && (
        <div className="space-y-2 border-b border-line bg-brand/10 px-4 py-3">
          {teams.map((t) => (
            <TeamResultLine key={t.id} team={t} />
          ))}
        </div>
      )}
      {results.length === 0 ? (
        <p className="px-4 py-3 text-sm text-ink-2">{meet.results.length}名が出場</p>
      ) : (
        events.map((ev) => (
          <div key={ev}>
            {ev && <h4 className="bg-surface-2 px-4 py-1 text-xs font-bold text-ink-2">{ev}</h4>}
            <ul className="divide-y divide-line">
              {results
                .filter((r) => (r.kind === "駅伝" ? "" : r.eventLabel) === ev)
                .map((r) => (
                  <ResultRow key={r.id} r={r} names={names} />
                ))}
            </ul>
          </div>
        ))
      )}
    </Card>
  );
}
