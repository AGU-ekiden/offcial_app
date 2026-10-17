import type { News } from "@/lib/types";

/** お知らせの遷移先。外部リンク > 関連する大会結果/予定 > 本文ページ の順で決める */
export function newsHref(n: News): { href: string; external: boolean } {
  if (n.link) return { href: n.link, external: true };
  if (n.resultIds.length) return { href: "/races/results", external: false };
  if (n.scheduleIds.length) return { href: `/races#${n.scheduleIds[0]}`, external: false };
  return { href: `/news/${n.id}`, external: false };
}
