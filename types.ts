# セットアップ手順

## ① Supabase の準備（約10分）

### 1. アカウント作成とプロジェクト作成
1. https://supabase.com にアクセス → 「Start your project」
2. GitHub アカウントでサインアップ（推奨）
3. 「New project」→ 以下を入力：
   - **Name**: `rkmusic-hub`
   - **Database Password**: 任意（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
4. 「Create new project」→ 数分待つ

### 2. データベースのテーブルを作成
1. 左メニュー「SQL Editor」→「New query」
2. このフォルダ内の `supabase/schema.sql` の内容を**全コピー**して貼り付け
3. 「Run」ボタンをクリック → "Success" が出ればOK

### 3. 管理者ユーザーを作成
1. 左メニュー「Authentication」→「Users」→「Add user」→「Create new user」
2. 以下を入力：
   - **Email**: あなたのメールアドレス（例: admin@gmail.com）
   - **Password**: 任意のパスワード（8文字以上推奨）
3. 「Create user」→ これが管理画面のログイン情報になります

### 4. API キーを確認
1. 左メニュー「Project Settings」→「API」
2. 以下の2つをメモ：
   - **Project URL**（例: `https://abcdefgh.supabase.co`）
   - **anon public** キー（`eyJhbGc...` から始まる長い文字列）

---

## ② GitHub にアップロード（約5分）

### 1. リポジトリを作成
1. https://github.com にログイン
2. 右上「＋」→「New repository」
3. 以下を入力：
   - **Repository name**: `rkmusic-hub`
   - **Visibility**: Private（非公開）を推奨
   - **Initialize this repository**: チェックしない
4. 「Create repository」

### 2. ファイルをアップロード
1. 作成したリポジトリのページで「uploading an existing file」をクリック
2. このフォルダの**中身をすべて選択**してドラッグ＆ドロップ
   - ※ `.gitignore` や `.github` フォルダも含めてアップロード
   - ※ `node_modules` フォルダは**アップロード不要**（存在しない場合は問題なし）
3. 「Commit changes」をクリック

---

## ③ Vercel にデプロイ（約5分）

### 1. Vercel アカウント作成
1. https://vercel.com → 「Sign Up」
2. GitHub アカウントでサインアップ（推奨）

### 2. プロジェクトをインポート
1. Vercel ダッシュボード → 「Add New Project」
2. 「Import Git Repository」→ `rkmusic-hub` を選択
3. 「Import」をクリック

### 3. 環境変数を設定（重要）
「Configure Project」画面の「Environment Variables」に以下を追加：

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon public キー |

### 4. デプロイ
「Deploy」ボタンをクリック → 1〜2分でデプロイ完了！

完了すると `https://rkmusic-hub-xxxx.vercel.app` のような URL が発行されます。

---

## ④ 動作確認

| URL | 内容 |
|-----|------|
| `https://あなたのURL.vercel.app/` | 公開サイト |
| `https://あなたのURL.vercel.app/admin` | 管理画面（要ログイン） |
| `https://あなたのURL.vercel.app/admin/login` | ログインページ |

---

## 曲を追加する手順

1. `/admin/login` にアクセス
2. Supabase で作成したメール・パスワードでログイン
3. アーティストタブを選択
4. フォームに入力して「追加する」

| フィールド | 説明 |
|-----------|------|
| タイトル | 曲名（必須） |
| 年 | リリース年（必須） |
| タイプ | orig / cover / collab |
| メンバー | lita, tina, nero, yomi, kasuka など |
| YouTube ID | YouTube URL の `?v=` 以降の文字列 |
| Spotify URL | Spotify の曲のリンク |
| コラボアーティスト | kmnz, vesp など（カンマ区切り） |

---

## ⚠️ 注意事項

- `.env.local` は**絶対に GitHub にアップロードしない**（.gitignore で除外済み）
- 環境変数は Vercel の管理画面でのみ設定する
- Supabase の管理者ユーザーのパスワードは定期的に変更することを推奨
