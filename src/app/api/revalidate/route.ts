import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { CACHE_TAG } from "@/lib/data";

// Notion の更新をすぐアプリに反映させるためのエンドポイント。
// Notion のボタン（Webhook 送信）や Notion オートメーションから叩く想定。
//   POST /api/revalidate?secret=<REVALIDATE_SECRET>            … 全データ
//   POST /api/revalidate?secret=<REVALIDATE_SECRET>&tag=news   … お知らせだけ
const TAGS = new Set([CACHE_TAG, "news", "columns", "members", "results", "schedule", "sponsors", "goods", "onrei", "photos", "teamResults", "ekidenRecords", "hsBests"]);

async function handle(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.nextUrl.searchParams.get("secret") ?? request.headers.get("x-revalidate-secret");
  if (!secret || given !== secret) {
    return Response.json({ ok: false, message: "invalid secret" }, { status: 401 });
  }

  const tag = request.nextUrl.searchParams.get("tag") ?? CACHE_TAG;
  if (!TAGS.has(tag)) {
    return Response.json({ ok: false, message: `unknown tag: ${tag}` }, { status: 400 });
  }

  // expire: 0 = 次のアクセスで必ず最新を取得する（古い内容を出さない）
  revalidateTag(tag, { expire: 0 });
  return Response.json({ ok: true, revalidated: tag });
}

export const GET = handle;
export const POST = handle;
