import type { NextRequest } from "next/server";
import { getBlockFileUrl, getPageFileUrl } from "@/lib/data";

// Notion にアップロードされた画像は署名付きURLが約1時間で失効する。
// このルートは毎回有効なURLを取り直してリダイレクトする（公開ページの許可された列のみ）。
//   /api/img?page=<pageId>&prop=<列名>&i=<番号>
//   /api/img?block=<blockId>
export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams;
  const block = qs.get("block");
  const page = qs.get("page");
  const prop = qs.get("prop");
  const index = Number(qs.get("i") ?? 0);

  let target: string | null = null;
  if (block && /^[0-9a-f-]{32,36}$/i.test(block)) {
    target = await getBlockFileUrl(block);
  } else if (page && prop && /^[0-9a-f-]{32,36}$/i.test(page) && Number.isInteger(index) && index >= 0) {
    target = await getPageFileUrl(page, prop, index);
  }

  if (!target) return new Response("Not found", { status: 404 });

  return new Response(null, {
    status: 307,
    headers: {
      Location: target,
      // 署名付きURLの有効期限より十分短くキャッシュさせる
      "Cache-Control": "public, max-age=600, s-maxage=1200",
    },
  });
}
