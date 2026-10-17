export const metadata = { title: "オフライン" };

export default function OfflinePage() {
  return (
    <div className="px-4 pt-20 text-center">
      <p className="font-display text-3xl font-bold">OFFLINE</p>
      <p className="mt-4 text-sm text-ink-2">
        インターネットに接続されていません。
        <br />
        接続が戻ったら再読み込みしてください。
      </p>
    </div>
  );
}
