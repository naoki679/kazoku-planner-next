# kazoku-planner-next プロジェクト引き継ぎ書

最終更新: 2026-05-31

---

## プロジェクト概要

**名称**: 家族の教育・老後資金プランナー  
**目的**: 学費（子ども4人分）と老後2,000万円目標をリアルタイムシミュレーションするWebアプリ。Cloudflare Pages（完全無料）でホスティングし、A8.netアフィリエイトで収益化。

---

## デプロイ情報

| 項目 | 値 |
|------|-----|
| 本番URL | https://kazoku-planner-next.pages.dev |
| GitHubリポジトリ | https://github.com/naoki679/kazoku-planner-next |
| ホスティング | Cloudflare Pages（無料） |
| ビルドコマンド | `npm run build` |
| 出力ディレクトリ | `out` |
| GitHubアカウント | naoki679 / camvp509@gmail.com |

コード更新手順:
```powershell
cd C:\Users\camvp\Documents\Claude\Projects\kazoku-planner-next
git add .
git commit -m "変更内容"
git push
# → Cloudflareが自動デプロイ（約2分）
# → ブラウザで Ctrl+Shift+R（強制リロード）
```

---

## 技術スタック

- **フレームワーク**: Next.js 16.2.6（`output: 'export'` 静的エクスポート）
- **言語**: TypeScript / React 19
- **スタイル**: Tailwind CSS v4 + インラインスタイル
- **ストレージ**: localStorage のみ（サーバー送信なし → データは端末内のみ）

---

## アプリ構成

```
/                    → public/index.html（オンボーディング＋家計管理ダッシュボード）
/planner/            → Next.js PlannerApp（教育・老後資金シミュレーター）
/kakeibo.html        → 家計管理（CSV取り込み・支出管理）
/lifeplan.html       → ライフプラン（将来シミュレーション）
```

**重要な構造上の注意**:
- `app/page.tsx` は削除済み（公開前の修正）。ルート`/`は`public/index.html`が担当。
- `app/planner/page.tsx` が `/planner/` を担当（Next.js）。

---

## ファイル構成（主要ファイル）

```
kazoku-planner-next/
├── app/
│   ├── layout.tsx           ← メタデータ設定
│   └── planner/page.tsx     ← プランナーページ（/planner/）
├── components/
│   ├── PlannerApp.tsx       ← メインアプリ（修正済み）
│   ├── AffiliateBanner.tsx  ← A8.netバナー管理コンポーネント
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── GoalBanner.tsx
│   ├── EducationSection.tsx
│   ├── RetirementCard.tsx
│   ├── NeedBox.tsx
│   ├── YearlyTables.tsx
│   └── ConfigModal.tsx
├── lib/
│   ├── types.ts             ← AppConfig, InputState 型定義
│   ├── calculator.ts        ← 計算ロジック
│   └── storage.ts           ← localStorage読み書き（キー: lifePlanSim_v2）
├── public/
│   ├── index.html           ← トップページ兼ダッシュボード（5000行超）
│   ├── kakeibo.html         ← 家計管理
│   ├── lifeplan.html        ← ライフプラン
│   ├── _headers             ← Cloudflare セキュリティヘッダー
│   └── manifest.json        ← PWA設定
├── DEPLOY_GUIDE.md          ← Cloudflare Pagesデプロイ手順書
└── PROJECT_STATUS.md        ← このファイル
```

---

## localStorageキー一覧

| キー | 用途 | 使用ファイル |
|------|------|------------|
| `lifePlanSim_v2` | プランナーメインデータ | storage.ts（Next.js） |
| `lifePlanSim_private_v1` | index.html の保存データ | index.html |
| `lifePlanSim_onboarded_v1` | 初回ウィザード完了フラグ | index.html |
| `lifePlanSim_welcomed_v1` | ウェルカム完了フラグ | index.html |
| `kakeibo_v1` | 家計管理トランザクション | kakeibo.html |
| `kakeibo_cards_v1` | カード設定 | kakeibo.html |
| `kakeibo_budget_v1` | 予算設定 | kakeibo.html |
| `kazoku_premium_v1` | PRO版認証状態 | index.html |

---

## A8.netアフィリエイト設定（未完了）

現在はプレースホルダー（`【YOUR_A8_TAG_xxx】`）の状態。

**タグを差し替える箇所**:
1. `components/AffiliateBanner.tsx` → `BANNERS` 配列内の `tag` フィールド
2. `public/index.html` → フッターの `<!-- バナー1: 学資保険 -->` 等のTODOコメント箇所

**推奨広告主カテゴリ**:
- 学資保険（ソニー生命、フコク生命）→ 資料請求 500〜2,000円
- iDeCo・NISA（SBI証券、楽天証券）→ 口座開設 数千円
- FP無料相談（保険チャンネル等）→ 1件 2,000〜5,000円（最高単価）

---

## PRO版について

現状: コードを知っていれば誰でも使える状態（テスト用コード `KAZOKU-PREMIUM-2024` がソースに含まれる）。

**本番前に必要な対応**:
- `KAZOKU-PREMIUM-2024` を削除
- 有料購入者への個別コード発行フロー（Stripe等）を実装

---

## 完了した修正・改善履歴

### Cloudflare対応
- `@netlify/plugin-nextjs` をpackage.jsonから削除
- `public/_headers` でセキュリティヘッダー追加
- `app/page.tsx` 削除（`public/index.html` をルートとして使用するため）

### バグ修正
- `PlannerApp.tsx` ファイル破損（nullバイト）を修正
- `package.json` ファイル破損を修正
- `package-lock.json` を再生成（netlifyプラグイン削除後）

### オンボーディングウィザード改善（index.html）
- `showOnboarding()`: ウィザード起動時にサイドバー現在値を引き継ぐよう修正
- `OB_SPOUSE` 変数追加: 配偶者選択状態を正確に追跡
- `obApplyIncome()`: 配偶者収入・ボーナスをサイドバーに反映（recalc後に再設定）
- `obNext()`: STEP1→2遷移時にも年齢・配偶者を即反映
- `finishOnboarding()`: 全項目を確実に反映してから完了

### 家計管理UI改善（kakeibo.html）
- カード選択時に `.card-chip.selected` CSSクラスで強調表示
- 選択中カードに「✓ 選択中」バッジ、拡大、青枠表示
- `setUploadTarget()` で `renderCardBar()` を呼んで即時反映

### ウィザード修正（index.html）
- `obSetSpouse()` 関数が未定義だったバグを修正（配偶者収入・ボーナス反映）

### 家計管理 機能追加・修正（kakeibo.html）
- ETC往復など重複明細の強制取り込みボタンを改善（一部重複時も表示）
- 月別収入手動調整機能を追加（収入カード右上の✏️調整ボタン）
- 「移動交通費🚗」カテゴリをデフォルト追加
- カスタムカテゴリ自由追加機能（手動入力モーダルの＋追加ボタン）
- 固定費モーダル：ゴミ箱ボタンのレイアウト修正、カテゴリ変更時に計上済み明細も同期
- 月別バーチャート整理（収入・支出2本に統一、収入は設定値を反映）
- 手動入力収入をINCOME_OVERRIDEに反映するよう修正
- 日別カレンダーをカテゴリ別支出の下に追加
- カテゴリ別支出UIをコンパクトに調整

### 技術的注意（kakeibo.html編集時）
- **EditツールはNG**：大きなファイルを壊す。必ず `python3` + `content.replace()` で編集すること
- 編集後は必ず `node --check` で構文確認し、`tail -3` でファイル末尾を確認

---

## 現在の課題・TODO

- [ ] A8.netに登録し、広告主に提携申請する
- [ ] 実際のA8.netタグをAffiliateBanner.tsxとindex.htmlのTODO箇所に貼り替える
- [ ] PRO版のテストコードを削除し、本番用の決済フロー（Stripe等）を実装
- [ ] Google Search Consoleに登録してSEO対策
- [ ] カレンダーの動作確認（日付タップで明細ジャンプ）
- [ ] カスタムカテゴリの動作確認

---

## セキュリティ・プライバシー

- **全データはlocalStorageのみ**（端末内）。外部サーバーへの送信なし。
- 他のユーザーのデータは見えない（完全に端末分離）。
- PRO版コードは現在ソースに平文記載 → 本番前に要対処。
