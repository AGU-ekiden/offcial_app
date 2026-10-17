"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Member } from "@/lib/types";
import { Avatar } from "./ui";

// 「推し選手」を端末の localStorage に保存する（ログイン不要）
const KEY = "agu:favorites";
const EVENT = "agu:favorites-change";

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useFavorites(): string[] {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function toggle(id: string) {
  const current = JSON.parse(read()) as string[];
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // プライベートモード等で保存できなくても致命的ではない
  }
  window.dispatchEvent(new Event(EVENT));
}

export function FavoriteButton({ id, name }: { id: string; name: string }) {
  const active = useFavorites().includes(id);
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition ${
        active ? "border-accent bg-accent text-black" : "border-line bg-surface text-ink"
      }`}
    >
      <span aria-hidden>{active ? "★" : "☆"}</span>
      {active ? "推し登録中" : `${name.split(/\s/)[0]}選手を推す`}
    </button>
  );
}

/** ホーム用：推し選手の横スクロール一覧 */
export function FavoriteStrip({ members }: { members: Member[] }) {
  const ids = useFavorites();
  const list = members.filter((m) => ids.includes(m.id));
  if (list.length === 0) {
    return (
      <p className="mx-4 rounded-2xl border border-dashed border-line p-4 text-sm text-ink-2">
        選手ページの「☆ 推す」を押すと、ここに推し選手が表示されます。
        <Link href="/members" className="ml-1 font-bold text-brand">
          選手を探す →
        </Link>
      </p>
    );
  }
  return (
    <ul className="scrollbar-none flex gap-4 overflow-x-auto px-4">
      {list.map((m) => (
        <li key={m.id} className="shrink-0">
          <Link href={`/members/${m.id}`} className="flex w-16 flex-col items-center gap-1 text-center">
            <Avatar src={m.photo} name={m.name} size={60} />
            <span className="line-clamp-1 text-xs font-medium">{m.name.split(/\s/)[0]}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
