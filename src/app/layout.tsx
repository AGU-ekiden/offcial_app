import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BottomNav, NavLinks } from "@/components/BottomNav";
import { ServiceWorkerRegister } from "@/components/client-utils";
import { SITE } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: SITE.shortName, template: `%s | ${SITE.shortName}` },
  description: SITE.description,
  applicationName: SITE.shortName,
  appleWebApp: { capable: true, title: SITE.shortName, statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00874a" },
    { media: "(prefers-color-scheme: dark)", color: "#0b110e" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">
        <header className="sticky top-0 z-20 bg-brand text-white" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <div className="mx-auto flex h-14 max-w-xl items-center px-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold tracking-wider">AGU EKIDEN</span>
              <span className="text-[10px] opacity-80">青山学院大学 陸上競技部</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-xl pb-28">{children}</main>

        <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur" aria-label="メインメニュー">
          <Suspense fallback={<NavLinks />}>
            <BottomNav />
          </Suspense>
        </nav>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
