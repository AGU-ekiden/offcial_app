"use client";

import { useEffect, useState } from "react";

/** Service Worker を登録してオフライン表示・ホーム画面追加を有効にする */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}

export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, text, url }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
      </svg>
      {copied ? "URLをコピーしました" : "シェア"}
    </button>
  );
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };

/** Android/Chrome でホーム画面追加を促すバナー（iOS は共有メニューから追加の案内） */
export function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let stored = false;
    try {
      stored = localStorage.getItem("agu:install-dismissed") === "1";
    } catch {}
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (stored || standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setDismissed(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const timer = setTimeout(() => {
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setIosHint(true);
        setDismissed(false);
      }
    }, 0);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(timer);
    };
  }, []);

  if (dismissed) return null;

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem("agu:install-dismissed", "1");
    } catch {}
  };

  return (
    <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-brand-deep p-3 text-white">
      <p className="flex-1 text-sm">
        {iosHint ? "共有ボタン →「ホーム画面に追加」でアプリとして使えます" : "ホーム画面に追加してアプリとして使えます"}
      </p>
      {deferred && (
        <button
          type="button"
          className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-brand-deep"
          onClick={async () => {
            await deferred.prompt();
            close();
          }}
        >
          追加
        </button>
      )}
      <button type="button" onClick={close} aria-label="閉じる" className="px-1 text-lg leading-none">
        ×
      </button>
    </div>
  );
}
