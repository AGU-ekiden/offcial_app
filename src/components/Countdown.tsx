"use client";

import { useSyncExternalStore } from "react";
import { daysBetween, todayJst } from "@/lib/time";

// 日付はキャッシュされたHTMLに焼き込まず、閲覧時に端末側で計算する
const subscribe = () => () => {};

export function Countdown({ date }: { date: string }) {
  const days = useSyncExternalStore(
    subscribe,
    () => daysBetween(todayJst(), date.slice(0, 10)),
    () => null,
  );
  if (days === null) return <span className="font-display text-4xl font-bold tabular">--</span>;
  if (days <= 0) return <span className="font-display text-3xl font-bold">TODAY</span>;
  return (
    <span className="font-display tabular">
      <span className="text-sm">あと</span>
      <span className="mx-1 text-4xl font-bold">{days}</span>
      <span className="text-sm">日</span>
    </span>
  );
}
