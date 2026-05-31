# Cloudflare Pages デプロイ手順（完全無料）

## 全体の流れ

```
① GitHub にリポジトリ作成 & プッシュ
② Cloudflare Pages でデプロイ（GitHub連携）
③ A8.net でアフィリエイト登録 & バナータグ取得
④ バナータグをコードに貼り付けて再デプロイ
```

---

## STEP 1：Git 初期化 & GitHub プッシュ

PowerShell で実行：

```powershell
cd C:\Users\camvp\Documents\Claude\Projects\kazoku-planner-next

# 既存の壊れた .git があれば削除
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Git 初期化
git init -b main
git config user.email "camvp509@gmail.com"
git config user.name "naoki"
git add .
git commit -m "feat: family finance planner with Cloudflare Pages"
```

次に GitHub でリポジトリ作成：

1. https://github.com/new を開く
2. Repository name: `kazoku-planner-next`
3. **Public** を選択（Cloudflare無料プランはPublic推奨）
4. README / .gitignore / license は**追加しない**
5. 「Create repository」をクリック

作成後、表示されたURLでプッシュ：

```powershell
git remote add origin https://github.com/camvp509/kazoku-planner-next.git
git push -u origin main
```

---

## STEP 2：Cloudflare Pages デプロイ

1. https://pages.cloudflare.com にアクセス（無料アカウント作成 or ログイン）
2. 「Create a project」→「Connect to Git」
3. GitHub アカウントを連携し `kazoku-planner-next` を選択
4. ビルド設定を以下に設定：

   | 項目 | 値 |
   |------|-----|
   | Framework preset | `Next.js (Static HTML Export)` |
   | Build command | `npm run build` |
   | Build output directory | `out` |
   | Node.js version | `20` |

5. 「Save and Deploy」をクリック
6. 2〜3分でデプロイ完了 → URLが発行されます

**発行されるURL例:**
```
https://kazoku-planner-next.pages.dev
```

> ✅ 独自ドメインも無料で設定できます（Cloudflare DNS経由）

---

## STEP 3：A8.net アフィリエイト登録

1. https://www.a8.net/ にアクセスしてアカウント作成（無料）
2. ログイン後「広告主を探す」→ 以下のカテゴリで検索：

   | キーワード | 狙う広告主の例 |
   |-----------|--------------|
   | 学資保険 | ソニー生命、フコク生命、明治安田生命 |
   | iDeCo / NISA | SBI証券、楽天証券、マネックス証券 |
   | FP相談 | 保険チャンネル、ほけんのぜんぶ、FP相談ねっと |
   | 教育ローン | オリコ、みずほ銀行教育ローン |

3. 気に入った広告主の「提携申請」をクリック
4. 承認（即時〜数日）されたら「広告タグ取得」→ バナーサイズ `300×100` を選択してタグをコピー

---

## STEP 4：バナータグをコードに貼り付け

### index.html（トップページ）

`public/index.html` の `<!-- バナー1: 学資保険 -->` 付近の `<!-- TODO -->` コメントを探し、
取得したA8.netタグに差し替えてください：

```html
<!-- 差し替え前（プレースホルダー） -->
<a href="https://px.a8.net/svt/ejp?a8mat=【YOUR_A8_TAG_GAKUSHI】" ...>

<!-- 差し替え後（A8.netから取得した実際のタグ） -->
<a href="https://px.a8.net/svt/ejp?a8mat=3TXXXXX_XXXXXX_XXXXX_XXXXX" rel="nofollow" target="_blank">
  <img border="0" width="300" height="100" alt="ソニー生命学資保険"
       src="https://www14.a8.net/0.gif?a8mat=3TXXXXX...（実際のURL）" />
</a>
<img border="0" width="1" height="1" src="https://www11.a8.net/0.gif?a8mat=3TXXXXX..." alt="">
```

### プランナー画面（Next.js コンポーネント）

`components/AffiliateBanner.tsx` の `BANNERS` 配列内の `tag` を同様に差し替えてください。

---

## STEP 5：更新をデプロイ

バナータグを貼り替えたら：

```powershell
cd C:\Users\camvp\Documents\Claude\Projects\kazoku-planner-next
git add .
git commit -m "feat: add A8.net affiliate banners"
git push
```

Cloudflare Pages が自動的に再ビルド・デプロイします（約2分）。

---

## 収益化のコツ

- **FP無料相談系**が最も単価が高い（1件 2,000〜5,000円）
- 学資保険・iDeCo系は資料請求で 500〜2,000円
- バナーは「コンテンツに溶け込む」位置に置くとクリック率UP
- Google Search Console に登録してSEO対策も並行して行う

---

## トラブルシューティング

### ビルドが失敗する場合
- Cloudflare の「Environment variables」に `NODE_VERSION=20` を追加
- `npm run build` をローカルで実行して先にエラーを確認

### バナーが表示されない場合
- A8.netの提携がまだ「審査中」→ 承認を待つ
- プレースホルダー画像（placehold.co）はデプロイ環境でブロックされることがある → 実際のA8タグに差し替えてください
