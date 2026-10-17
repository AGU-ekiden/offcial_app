/**
 * Cache Components では generateStaticParams が空配列だとビルドエラーになる。
 * データが0件のとき用にダミーIDを1つ返す（そのページは 404 になる）。
 */
export function atLeastOne<T extends { id: string }>(params: T[]): { id: string }[] {
  return params.length > 0 ? params : [{ id: "_" }];
}
