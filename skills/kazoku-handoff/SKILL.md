---
name: kazoku-handoff
description: >
  kazoku-planner-next プロジェクトの引き継ぎスキル。新しいチャットを開始したとき、
  またはユーザーが「引き継ぎ」「続きから」「プロジェクトの状況」「前回の続き」
  「コンテキストを読み込んで」と言ったときに必ず使う。
  プロジェクトの全状況（デプロイ先URL、ファイル構成、修正履歴、TODO）を
  PROJECT_STATUS.md から読み込み、即座に作業を継続できる状態にする。
---

# kazoku-planner-next 引き継ぎスキル

## 最初にやること

1. `PROJECT_STATUS.md` を読む（パス: `C:\Users\camvp\Documents\Claude\Projects\kazoku-planner-next\PROJECT_STATUS.md`）
2. 内容をもとにユーザーに現状サマリーを伝える
3. 「何から始めますか？」と聞く

## 現状サマリーの伝え方

以下のフォーマットで簡潔に伝える（長々と説明しない）:

```
## プロジェクト: 家族の教育・老後資金プランナー

**本番URL**: https://kazoku-planner-next.pages.dev
**GitHub**: naoki679/kazoku-planner-next
**ホスティング**: Cloudflare Pages（無料）

**前回完了した作業**:
（PROJECT_STATUS.mdの「完了した修正・改善履歴」から主要なものを箇条書き）

**残タスク**:
（PROJECT_STATUS.mdの「現在の課題・TODO」をそのまま表示）

何から始めますか？
```

## コード変更時のルール

変更をCloudflareに反映するには必ずこの手順:
1. ユーザーにPowerShellで以下を実行してもらう:
   ```powershell
   cd C:\Users\camvp\Documents\Claude\Projects\kazoku-planner-next
   git add .
   git commit -m "変更内容"
   git push
   ```
2. 約2分待つ（Cloudflareが自動ビルド）
3. ブラウザで `Ctrl+Shift+R`（強制リロード）

## 重要な技術的注意事項

### ファイル書き込みについて
- Writeツールで書き込むとnullバイトが付くことがある
- 大きなファイル（kakeibo.html, index.html など）はEditツールで差分編集する
- bashで書き直す場合は `cat > file << 'EOF'` 形式を使う

### ビルドについて
- `output: 'export'` なので完全静的HTML生成
- `app/page.tsx` は削除済み（ルート`/`は`public/index.html`が担当）
- ビルド確認: `npm run build`（sandboxで実行可能）

### localStorageキーの使い分け
- `index.html` → `lifePlanSim_private_v1`
- Next.js（/planner/） → `lifePlanSim_v2`
- 両者は別キーなので、ウィザードとプランナーのデータ同期に注意

### デプロイ済みのプレースホルダー
- A8.netバナーは `【YOUR_A8_TAG_xxx】` のプレースホルダーのまま
- PRO版テストコード `KAZOKU-PREMIUM-2024` がソースに残っている（本番前要削除）

## PROJECT_STATUS.mdの更新

作業が完了したら必ずPROJECT_STATUS.mdを更新する:
- 「完了した修正」セクションに追記
- 「現在の課題・TODO」から完了項目を削除
- 新たなTODOがあれば追加
- 最終更新日を更新

これにより次のチャットでも完璧に引き継げる。
