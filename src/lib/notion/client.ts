// Notion REST API の薄いラッパー。公式サイト(agu-ekiden-site)と同じく SDK は使わず fetch で叩く。

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";
const MAX_RETRIES = 4;

export type RichText = {
  plain_text: string;
  href: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
};

export type NotionFile =
  | { name: string; type: "file"; file: { url: string; expiry_time?: string } }
  | { name: string; type: "external"; external: { url: string } };

export type NotionProperty = { type: string; [key: string]: unknown };

export type NotionPage = {
  id: string;
  object: "page";
  created_time: string;
  last_edited_time: string;
  archived?: boolean;
  in_trash?: boolean;
  parent: { type: string; database_id?: string; page_id?: string };
  properties: Record<string, NotionProperty>;
};

export type NotionBlock = {
  id: string;
  type: string;
  has_children: boolean;
  parent: { type: string; page_id?: string; block_id?: string };
  children?: NotionBlock[];
  [key: string]: unknown;
};

type ListResponse<T> = { results: T[]; has_more: boolean; next_cursor: string | null };

export function isNotionConfigured(): boolean {
  return Boolean(process.env.NOTION_TOKEN);
}

async function notionFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN が設定されていません");

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": VERSION,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (res.ok) return (await res.json()) as T;

    // レート制限 (平均3req/s) と一時的なサーバーエラーはリトライする
    const retryable = res.status === 429 || res.status >= 500;
    if (retryable && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 500;
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    const body = await res.text();
    throw new Error(`Notion API ${res.status} ${path}: ${body.slice(0, 300)}`);
  }
}

/** データベースをクエリし、ページネーションをたどって全件返す（limit 指定時はそこで打ち切る） */
export async function queryDatabase(
  databaseId: string,
  body: { filter?: unknown; sorts?: unknown[] } = {},
  limit?: number,
): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const pageSize = limit ? Math.min(100, limit - pages.length) : 100;
    const res = await notionFetch<ListResponse<NotionPage>>(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({ ...body, page_size: pageSize, start_cursor: cursor }),
    });
    pages.push(...res.results);
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor && (!limit || pages.length < limit));
  return pages;
}

export function retrievePage(pageId: string): Promise<NotionPage> {
  return notionFetch<NotionPage>(`/pages/${pageId}`);
}

export function retrieveBlock(blockId: string): Promise<NotionBlock> {
  return notionFetch<NotionBlock>(`/blocks/${blockId}`);
}

/** ページ本文のブロックを再帰的に取得する（トグルやカラムの中身も含む） */
export async function listBlocks(blockId: string, depth = 0): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const qs = new URLSearchParams({ page_size: "100" });
    if (cursor) qs.set("start_cursor", cursor);
    const res = await notionFetch<ListResponse<NotionBlock>>(`/blocks/${blockId}/children?${qs}`);
    blocks.push(...res.results);
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  if (depth < 2) {
    await Promise.all(
      blocks
        .filter((b) => b.has_children && b.type !== "child_page" && b.type !== "child_database")
        .map(async (b) => {
          b.children = await listBlocks(b.id, depth + 1);
        }),
    );
  }
  return blocks;
}
