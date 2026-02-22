# Next.js Sample

- Next.jsを使ったサンプルアプリケーションです。

## 技術要素

- mise
- Next.js
- React
- Tailwind CSS
- daisyUI
- React Hook Form
- Better Auth
- Prisma
- Zod
- date-fns
- TanStack Table

## 環境構築ガイド

- [環境構築ガイド](./docs/SETUP.md)

## 機能

- ログイン・ログアウト
- パスワード初期化
- アカウント情報の表示・更新
- パスワード変更
- 通知センター（一覧・検索・既読化）
- 管理者向けユーザー管理（一覧・詳細・新規作成・編集）
- 管理者向け通知管理（一覧・詳細・新規作成・編集・アーカイブ）

## 画面一覧

| 画面名                 | URL                            |
| ---------------------- | ------------------------------ |
| ログイン               | /sign-in                       |
| パスワード初期化       | /reset-password                |
| アカウント情報         | /account                       |
| パスワード変更         | /account/password              |
| 通知センター           | /notifications                 |
| 管理者画面トップ       | /admin                         |
| 管理者ユーザー一覧     | /admin/users                   |
| 管理者ユーザー新規作成 | /admin/users/create            |
| 管理者ユーザー詳細     | /admin/users/[id]              |
| 管理者ユーザー編集     | /admin/users/[id]/edit         |
| 管理者通知一覧         | /admin/notifications           |
| 管理者通知新規作成     | /admin/notifications/create    |
| 管理者通知詳細         | /admin/notifications/[id]      |
| 管理者通知編集         | /admin/notifications/[id]/edit |

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
