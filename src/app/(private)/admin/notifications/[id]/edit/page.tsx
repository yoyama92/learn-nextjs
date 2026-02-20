import Link from "next/link";

import { definePrivatePage } from "../../../../../../components/_common/page";

export default definePrivatePage<{ id: string }>({
  adminOnly: true,
  name: "admin_notification_edit",
}).page(async ({ props: { params } }) => {
  const { id } = await params;

  return (
    <main className="mx-auto min-w-xs max-w-2xl p-3 md:p-6 space-y-4">
      <h2 className="text-lg font-bold">通知編集</h2>
      <div className="alert">
        <span>編集機能はこれから実装します。対象ID: {id}</span>
      </div>
      <Link href="/admin/notifications" className="link link-hover text-sm">
        通知一覧へ戻る
      </Link>
    </main>
  );
});
