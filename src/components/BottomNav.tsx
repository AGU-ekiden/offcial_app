"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "ホーム", icon: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { href: "/news", label: "ニュース", icon: "M4 5h13v14H5a1 1 0 0 1-1-1zm13 4h3v9a1 1 0 0 1-1 1h-2M7 9h7M7 12h7M7 15h4" },
  { href: "/members", label: "選手", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0" },
  { href: "/races", label: "大会", icon: "M5 21V4m0 1h11l-2 4 2 4H5" },
  { href: "/support", label: "応援", icon: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" },
];

export function NavLinks({ active }: { active?: string }) {
  return (
    <ul className="mx-auto grid max-w-xl grid-cols-5">
      {ITEMS.map((item) => {
        const isActive = active !== undefined && (item.href === "/" ? active === "/" : active.startsWith(item.href));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? "text-brand" : "text-ink-2"}`}
              aria-current={isActive ? "page" : undefined}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={isActive ? 2.2 : 1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return <NavLinks active={pathname} />;
}
