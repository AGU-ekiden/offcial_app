# 青山学院大学陸上競技部 長距離ブロック 公式アプリ

「通知・速報・応援」でファンとチームをつなぐ公式アプリです（iPhone / Android）。
記録の公式な置き場は[公式サイト](https://aogaku-tf.com/)で、アプリは「いち早く届く」「ここでしか見られない」ための場所です。
企画の全文は [`docs/app-plan.md`](docs/app-plan.md)、開発の約束ごとは [`CLAUDE.md`](CLAUDE.md) にあります。

## 最初の版の機能

| タブ | 内容 |
|---|---|
| ホーム | 次の大会までの日数、最新の結果、新着ニュース、限定動画 |
| 新着 | ニュースの一覧（結果・予定・お知らせで絞り込み） |
| 大会 | これからの予定（月ごと・日程未定）と直近1年ほどの結果（駅伝は区間ごと）。過去の記録は公式サイトへ |
| 部員 | 選手・マネージャー・スタッフを全員同じ形で紹介。選手ごとに「結果の通知を受け取る」 |
| 動画 | 学内タイムトライアル・練習・合宿・寮生活などの限定動画 |

- ログインはありません。通知の設定と選んだ選手は端末の中だけに保存します
- フォローの数・人気の順位などは、どこにも表示しません（`CLAUDE.md` の方針）
- 一度読み込んだデータは端末に保存し、オフラインでも前回の内容を表示します

## しくみ

```
Notion（部員が入力）→「サイト更新」ボタン → GitHub Actions（公式サイトのリポジトリ）
  ├─ 公式サイトを作る ─────────────┐
  ├─ アプリ用データ app/v1/data.json ─┴→ ロリポップ（aogaku-tf.com）
  └─ 新着があれば Firebase Cloud Messaging でトピックへ通知
アプリ → https://aogaku-tf.com/app/v1/data.json を読む（Notion には直接つながない）
```

- アプリ用データを作るのは公式サイトのリポジトリ（`ekidenagustaff-debug/agu-ekiden-site`）の `lib/app-data.js`、通知を送るのは `scripts/notify-app.mjs`
- データの形はアプリの `src/data/types.ts` と合わせる。形を大きく変えるときは両方の `schemaVersion` を上げる（古いアプリには「アップデートしてください」と表示される）
- 通知はトピック（`news` / `results` / `videos` / `member-<部員ID>`）を購読するだけなので、端末の登録やサーバーは不要

## 開発

Node.js 20 以上が必要です。

```bash
npm install
npm run start:sample   # サンプルデータ（架空）で起動
npm start              # 本番のデータ（aogaku-tf.com）で起動
```

- 画面の確認は Expo Go でもできます（通知だけは動きません）
- 通知まで試すには開発ビルドが必要です：`npx eas-cli@latest build --profile development`
- データの読み込み先を変えるときは `EXPO_PUBLIC_DATA_URL` を設定します

チェック（コミット前に必ず実行）:

```bash
npm run typecheck
npm run lint
npm test
```

### フォルダ

```
src/
├── app/            画面（Expo Router。ファイル＝画面）
│   ├── (tabs)/     下のタブ：ホーム・新着・大会・部員・動画
│   ├── member/ meet/ schedule/ video/   詳細画面
│   └── settings.tsx  通知とアプリの設定
├── components/     共通の部品（ui.tsx・cards.tsx・icon.tsx）
├── data/           データの型・読み込み・日付の表示・サンプルデータ
├── notifications/  Firebase（通知）と、通知・フォローの設定
└── constants/      色・余白
```

## 通知（Firebase）の準備

1. [Firebase コンソール](https://console.firebase.google.com/)でプロジェクトを作り、iOS アプリと Android アプリを追加する（バンドルID は `app.config.ts` の `BUNDLE_ID`）
2. iOS：Apple Developer で APNs 認証キー（.p8）を作り、Firebase の「Cloud Messaging」に登録する
3. `GoogleService-Info.plist` と `google-services.json` を EAS の環境変数（種類：ファイル）に `GOOGLE_SERVICES_PLIST` / `GOOGLE_SERVICES_JSON` として登録する。手元で試すときは `firebase/` フォルダに置く（Git には入れない）
4. Firebase の「サービスアカウント」で秘密鍵（JSON）を作り、公式サイトのリポジトリの GitHub Secret `FIREBASE_SERVICE_ACCOUNT` に登録する

設定ファイルが無いときは Firebase を組み込まずにビルドし、通知以外はそのまま動きます。

## ストアへの公開

```bash
npx eas-cli@latest build --profile preview      # 部内テスト用（TestFlight / 内部テスト）
npx eas-cli@latest build --profile production
npx eas-cli@latest submit --profile production
```

公開の前に `docs/app-plan.md` の「決めること」を済ませる（とくにストアの名義・アプリ名・アイコン）。
今のアプリ名「青学駅伝」・アイコン・バンドルID（`com.aogakutf.official`）は仮のものです。
プライバシーポリシーは公式サイトの `privacy.html` に置く前提です（設定画面からリンク）。
