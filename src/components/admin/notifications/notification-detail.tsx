import Link from "next/link";

import type { AdminNotificationDetail } from "../../../schemas/admin-notification";
import {
  toAudienceLabel,
  toStatusLabel,
  toTypeLabel,
} from "./notification-list-types";
import { RecipientUserTable } from "./recipient-user-table";

const toDateTimeLabel = (value: Date | null, nullLabel: string = "未設定") => {
  if (!value) {
    return nullLabel;
  }
  return value.toLocaleString("ja-JP");
};

export const NotificationDetail = ({
  notification,
}: {
  notification: AdminNotificationDetail;
}) => {
  return (
    <main className="mx-auto w-full min-w-xs max-w-5xl p-3 md:p-6">
      <h2 className="text-lg font-bold">通知詳細</h2>
      <div className="card bg-base-100">
        <div className="card-body gap-4">
          <div className="card-title">基本情報</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>タイトル: {notification.title}</div>
            <div>種別: {toTypeLabel(notification.type)}</div>
            <div>対象: {toAudienceLabel(notification.audience)}</div>
            <div>状態: {toStatusLabel(notification.status)}</div>
            <div>公開日時: {toDateTimeLabel(notification.publishedAt)}</div>
            <div>
              アーカイブ日時: {toDateTimeLabel(notification.archivedAt)}
            </div>
            <div>作成日時: {toDateTimeLabel(notification.createdAt)}</div>
            <div>更新日時: {toDateTimeLabel(notification.updatedAt)}</div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold">本文</p>
            <p className="whitespace-pre-wrap rounded-box border border-base-300 p-3">
              {notification.body}
            </p>
          </div>
          {notification.audience === "SELECTED" && (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">対象ユーザー</p>
              {notification.recipients.length === 0 ? (
                <div className="rounded-box border border-base-300 p-3 text-sm text-base-content/70">
                  対象ユーザーがありません。
                </div>
              ) : (
                <RecipientUserTable
                  rows={notification.recipients.map((recipient) => ({
                    userId: recipient.userId,
                    name: recipient.name,
                    email: recipient.email,
                    readAtLabel: toDateTimeLabel(recipient.readAt, "未読"),
                  }))}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-row justify-end gap-2">
        <Link
          href={`/admin/notifications/${notification.id}/edit`}
          className="btn btn-primary"
        >
          編集
        </Link>
        <Link href="/admin/notifications" className="btn btn-outline">
          一覧に戻る
        </Link>
      </div>
    </main>
  );
};
