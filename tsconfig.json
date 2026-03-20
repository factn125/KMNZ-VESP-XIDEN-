# RK Music Hub — Next.js + Supabase

## 📦 技術スタック

| 役割 | ツール |
|------|--------|
| フロントエンド | Next.js 14 (App Router) |
| データベース / 認証 | Supabase (PostgreSQL) |
| ホスティング | Vercel |

---

## 🚀 セットアップ手順

### 1. Supabase プロジェクト作成

1. https://supabase.com でアカウント作成
2. 「New project」→ プロジェクト名・パスワード設定
3. **SQL Editor** を開き、`supabase/schema.sql` の内容をコピーして実行
   - テーブル・RLS・初期データが一括で作成されます

### 2. 管理者ユーザーを作成

Supabase ダッシュボード → **Authentication** → **Users** → **Add user**
- Email と Password を設定（これが管理画面のログイン情報）

### 3. 環境変数を設定

```bash
cp .env.local.example .env.local
```

`.env.local` を開き、Supabase の値を入力：
- **URL**: Project Settings → API → Project URL
- **Anon Key**: Project Settings → API → anon public

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. ローカル開発

```bash
npm install
npm run dev
# → http://localhost:3000
```

管理画面: http://localhost:3000/admin

### 5. Vercel にデプロイ

1. GitHub にリポジトリを作成してこのコードをプッシュ
2. https://vercel.com → 「New Project」→ リポジトリを選択
3. Environment Variables に `.env.local` の値を入力
4. Deploy ボタンを押すだけ！

---

## 📁 ファイル構成

```
rkmusic-hub/
├── app/
│   ├── page.tsx              # 公開サイト
│   ├── page.module.css       # 公開サイトのスタイル
│   ├── globals.css           # 共通CSS変数
│   ├── layout.tsx
│   ├── admin/
│   │   ├── page.tsx          # 管理画面（要ログイン）
│   │   └── login/page.tsx    # ログインページ
│   └── api/
│       ├── songs/route.ts    # 曲 CRUD API
│       └── artists/route.ts  # アーティスト API
├── lib/
│   ├── supabase.ts           # Supabaseクライアント
│   └── types.ts              # TypeScript型定義
├── supabase/
│   └── schema.sql            # DBテーブル定義（要実行）
├── .env.local.example        # 環境変数テンプレート
└── README.md
```

---

## ✏️ 曲の追加方法

1. `/admin/login` にアクセス
2. Supabase で作成したメール/パスワードでログイン
3. アーティストを選択 → フォームに入力 → 「追加する」

| フィールド | 内容 |
|-----------|------|
| タイトル | 曲名 |
| 年 | リリース年 |
| タイプ | orig / cover / collab |
| メンバー | lita, tina, nero, yomi, kasuka 等 |
| YouTube ID | URL の `v=` 以降（例: `7kTUgS414QE`） |
| Spotify URL | Spotify の曲URL |
| コラボアーティスト | kmnz, vesp 等（カンマ区切り） |

---

## 🔒 セキュリティについて

- **RLS（Row Level Security）**により、公開サイトからのDB書き込みは一切不可
- 読み取りは全員可、書き込みは認証ユーザーのみ
- 管理者は Supabase Authentication で管理（パスワード変更もSupabaseから）
