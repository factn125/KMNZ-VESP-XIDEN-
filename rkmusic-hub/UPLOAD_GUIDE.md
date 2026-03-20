# GitHubへの正しいアップロード手順

## ⚠️ ドラッグ＆ドロップは使わないでください
GitHub のファイルアップロード画面でドラッグ＆ドロップすると、ファイル名と内容が入れ替わる場合があります。

## ✅ 正しい方法：Git コマンドを使う

### 必要なもの
- [Git](https://git-scm.com/downloads) のインストール（まだの場合）
- GitHubアカウント

---

### 手順

#### 1. このZIPを解凍する
ZIPを解凍すると `rkmusic-hub` フォルダが出てきます。

#### 2. ターミナル（コマンドプロンプト）を開く
- **Windows**: スタートメニュー → 「cmd」または「PowerShell」
- **Mac**: Spotlight → 「ターミナル」

#### 3. フォルダに移動する
```
cd デスクトップ/rkmusic-hub
```
（解凍した場所に応じてパスを変更してください）

#### 4. Gitの初期設定（初回のみ）
```
git config --global user.email "あなたのメールアドレス"
git config --global user.name "あなたの名前"
```

#### 5. Gitリポジトリを初期化
```
git init
git add .
git commit -m "Initial commit"
```

#### 6. GitHubにリポジトリを作成
1. https://github.com/new にアクセス
2. Repository name: `rkmusic-hub`
3. Private を選択
4. **「Initialize this repository」のチェックは外す**
5. 「Create repository」をクリック

#### 7. GitHubにプッシュ
GitHub のページに表示されるコマンドをそのまま実行：
```
git remote add origin https://github.com/あなたのID/rkmusic-hub.git
git branch -M main
git push -u origin main
```

#### 8. 確認
GitHubのリポジトリページを開いて、以下のフォルダ構造になっていればOKです：
```
rkmusic-hub/
├── app/
│   ├── page.tsx          ← 'use client' から始まる
│   ├── page.module.css   ← /* ══ TOPBAR ══ */ から始まる
│   ├── globals.css
│   ├── layout.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   └── login/page.tsx
│   └── api/
│       ├── songs/route.ts
│       ├── artists/route.ts
│       └── youtube-thumbnail/route.ts
├── lib/
│   ├── supabase.ts
│   └── types.ts
├── supabase/
│   └── schema.sql        ← -- で始まるSQLコメント
├── .github/workflows/
│   └── deploy.yml        ← name: Deploy to Vercel から始まる
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.local.example
├── SETUP.md
└── README.md
```

---

## 各ファイルの正しい内容（確認用）

| ファイル | 最初の行 |
|---------|---------|
| `app/page.tsx` | `'use client'` |
| `app/page.module.css` | `/* ══ TOPBAR ══ */` |
| `app/globals.css` | `@import url('https://fonts.googleapis.com...` |
| `app/layout.tsx` | `import type { Metadata }` |
| `app/admin/page.tsx` | `'use client'` |
| `app/admin/login/page.tsx` | `'use client'` |
| `app/api/songs/route.ts` | `import { NextRequest` |
| `app/api/artists/route.ts` | `import { NextResponse }` |
| `app/api/youtube-thumbnail/route.ts` | `import { NextRequest` |
| `lib/supabase.ts` | `import { createBrowserClient` |
| `lib/types.ts` | `export type ArtistSlug` |
| `supabase/schema.sql` | `-- ===` (SQLコメント) |
| `.github/workflows/deploy.yml` | `name: Deploy to Vercel` |
| `package.json` | `{` (JSON) |
| `next.config.js` | `/** @type` |

