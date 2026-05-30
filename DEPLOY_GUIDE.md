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
https://kazoku-planner-next.pages.d