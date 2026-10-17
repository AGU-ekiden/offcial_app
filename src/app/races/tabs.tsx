import Link from "next/link";

export function RaceTabs({ active }: { active: "schedule" | "results" }) {
  const tabs = [
    { key: "schedule", href: "/races", label: "日程" },
    { key: "results", href: "/races/results", label: "結果" },
  ] as const;
  return (
    <div className="mx-4 mt-2 grid grid-cols-2 rounded-xl bg-surface-2 p-1 text-sm font-bold">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`rounded-lg py-2 text-center ${active === t.key ? "bg-surface shadow-sm" : "text-ink-2"}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
