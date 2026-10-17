"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Member } from "@/lib/types";
import { useFavorites } from "./favorites";
import { Avatar, Empty } from "./ui";

const GRADES = ["4年", "3年", "2年", "1年"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
        active ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function MemberDirectory({ members }: { members: Member[] }) {
  const [tab, setTab] = useState<"players" | "staff">("players");
  const [gender, setGender] = useState<string>("");
  const [query, setQuery] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const favorites = useFavorites();

  const genders = useMemo(() => [...new Set(members.map((m) => m.gender).filter(Boolean))], [members]);

  const filtered = useMemo(() => {
    const q = query.replace(/\s/g, "").toLowerCase();
    return members.filter((m) => {
      if ((tab === "players") !== (m.role === "選手")) return false;
      if (gender && m.gender !== gender) return false;
      if (onlyFav && !favorites.includes(m.id)) return false;
      if (q) {
        const hay = `${m.name}${m.nameRoman}${m.highSchool}`.replace(/\s/g, "").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [members, tab, gender, onlyFav, favorites, query]);

  const groups =
    tab === "players"
      ? GRADES.map((g) => ({ label: g, list: filtered.filter((m) => m.grade === g) }))
      : [{ label: "スタッフ", list: filtered }];

  return (
    <div>
      <div className="sticky top-14 z-10 space-y-3 bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="grid grid-cols-2 rounded-xl bg-surface-2 p-1 text-sm font-bold">
          {(["players", "staff"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg py-2 ${tab === t ? "bg-surface shadow-sm" : "text-ink-2"}`}
            >
              {t === "players" ? "選手" : "スタッフ"}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="名前・出身高校で検索"
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base outline-none focus:border-brand"
        />
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip active={!gender} onClick={() => setGender("")}>
            すべて
          </Chip>
          {genders.map((g) => (
            <Chip key={g} active={gender === g} onClick={() => setGender(gender === g ? "" : g)}>
              {g}
            </Chip>
          ))}
          <Chip active={onlyFav} onClick={() => setOnlyFav(!onlyFav)}>
            ★ 推し
          </Chip>
        </div>
      </div>

      {filtered.length === 0 && <Empty>該当する部員がいません</Empty>}

      {groups
        .filter((g) => g.list.length > 0)
        .map((g) => (
          <section key={g.label} className="mt-4">
            <h2 className="px-4 pb-2 text-sm font-bold text-ink-2">
              {g.label}
              <span className="ml-2 font-normal">{g.list.length}名</span>
            </h2>
            <ul className="grid grid-cols-3 gap-x-2 gap-y-5 px-4 sm:grid-cols-4">
              {g.list.map((m) => (
                <li key={m.id}>
                  <Link href={`/members/${m.id}`} className="flex flex-col items-center text-center">
                    <div className="relative">
                      <Avatar src={m.photo} name={m.name} size={84} />
                      {favorites.includes(m.id) && (
                        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-black">
                          ★
                        </span>
                      )}
                    </div>
                    <span className="mt-2 text-sm font-bold leading-tight">{m.name}</span>
                    <span className="mt-0.5 line-clamp-1 text-[11px] text-ink-2">
                      {m.position || m.highSchool || m.role}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
