# Next.js Sample

- Next.jsを使ったサンプルアプリケーションです。

## 技術要素

- Next.js
- React
- Tailwind CSS
- daisyUI
- React Hook Form
- Auth.js
- Prisma
- Zod

## 実行方法

1. 環境変数の設定
  - プロジェクトルートに`.env.local` を作成する。
  - 作成したファイルに以下の内容を設定する


2. 外部サービスの起動
   ```
   ## プロジェクトルートからdockerディレクトリに移動して実行する
   cd ./docker
   docker compose up -d
   ```

3. アプリケーションの起動
   ```
   ## プロジェクトルートで実行する
   pnpm i --frozen-lockfile
   pnpm dev
   ```

## アクセス情報

- アプリケーション：[localhost:3000](http://localhost:3000/)
- pgAdmin：[localhost:5050](http://localhost:5050/)
- Amazon SES：[localhost:8001](http://localhost:8005/)

## 機能

- ログイン・ログアウト
- パスワード初期化
- アカウント情報の表示・更新
- パスワード変更
- 管理者画面（ユーザー一覧の表示・ユーザーの登録）

## 画面一覧

| 画面名           | URL               |
| ---------------- | ----------------- |
| ログイン         | /sign-in          |
| パスワード初期化 | /password-reset   |
| アカウント情報   | /account          |
| パスワード変更   | /account/password |
| 管理者画面       | /admin            |

---
以下テンプレート


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
