import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 pt-20 text-center">
      <p className="font-display text-5xl font-bold text-brand">404</p>
      <p className="mt-4 text-sm text-ink-2">ページが見つかりませんでした</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-ink">
        ホームへ戻る
      </Link>
    </div>
  );
}
