# 環境構築ガイド

このドキュメントでは、プロジェクトの開発環境から実行までの手順を説明します。

## 📋 目次

1. [セットアップ手順](#セットアップ手順)
2. [開発環境の起動](#開発環境の起動)
3. [テスト・コード品質](#テストコード品質)
4. [データベース操作リファレンス](#データベース操作リファレンス)

---

## セットアップ手順

### 1. mise のセットアップ（初回のみ）

```bash
# mise のインストール
curl https://mise.run | sh

# 設定ファイルに追加
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
source ~/.bashrc

```

### 2. プロジェクトリポジトリでツールを自動セットアップ

```bash
mise install
```

### 3. Docker サービスのインストール＆起動

#### Docker をインストール（初回のみ）

[Docker 公式サイト](https://docs.docker.com/get-docker/)の手順に従ってインストールしてください。

#### Docker サービスを起動

```bash
# プロジェクトの docker ディレクトリに移動
cd docker

# コンテナを起動
docker compose up -d

```

### 4. 依存パッケージをインストール＆データベースを初期化

```bash
# プロジェクトルートで実行する

pnpm install --frozen-lockfile # ライブラリのインストール
pnpm prisma:migrate # テーブルの作成
pnpm prisma:seed    # テストデータを投入
```

### 5. 開発サーバーを起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

テストユーザーでログイン：
- **メール**: alice@example.com
- **パスワード**: aaaaaaaa

以上です！🎉

---

## テスト・コード品質

### ユニットテストの実行

```bash
# すべてのテストを実行
pnpm test

# 特定のファイルのテストを実行
pnpm test src/lib/__tests__/path.test.ts

# ウォッチモードで実行（ファイル変更時に自動実行）
pnpm test --watch
```

### コード品質チェック

このプロジェクトでは Biome をコード整形・リント に使用しています。

```bash
# Biome によるリント・フォーマット（VS Code でも自動実行）
# （VS Code の推奨拡張をインストール済みの場合）
```

### 不要な依存パッケージの検出

```bash
pnpm knip
```

このコマンドで、実際に使用されていないパッケージを検出できます。

---

## データベース操作リファレンス

### よく使う Prisma コマンド

| コマンド               | 説明                                                 |
| ---------------------- | ---------------------------------------------------- |
| `pnpm prisma:migrate`  | 新しいマイグレーションを作成して実行                 |
| `pnpm prisma:reset`    | データベースをリセット（スキーマ削除→再作成→シード） |
| `pnpm prisma:seed`     | シードスクリプトを実行                               |
| `pnpm prisma:generate` | Prisma Client を再生成                               |

### pgAdmin で UI 操作

1. http://localhost:5050 にアクセス
2. ログイン：
   - Email: `postgres@example.com`
   - Password: `password`
3. **Servers** → **Register** → **Server** でサーバーを登録
   - **Host name**: `db`
   - **Port**: `5432`
   - **Username**: `postgres_user`
   - **Password**: `password`

### コマンドラインでデータベースにアクセス

```bash
# Docker コンテナからアクセス
docker compose exec db psql -U postgres_user -d learn-nextjs

# SQL コマンドの例
SELECT * FROM "User" LIMIT 10;
SELECT COUNT(*) FROM "User";
```

---
