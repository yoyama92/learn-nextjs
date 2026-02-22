import {
  type NotificationAudience,
  type notificationArchiveFilterEnum,
  notificationAudienceEnum,
} from "../../../schemas/admin-notification";
import type { NotificationType } from "../../../schemas/notification";

export type AdminNotificationRow = {
  id: string;
  title: string;
  body: string;
  type: Exclude<NotificationType, "all">;
  audience: Exclude<NotificationAudience, "all">;
  publishedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  status: "published" | "scheduled" | "archived";
};

export type AdminNotificationSearchParams = {
  q: string;
  type: NotificationType;
  audience: NotificationAudience;
  archived:
    | typeof notificationArchiveFilterEnum.active
    | typeof notificationArchiveFilterEnum.archived;
  page: number;
};

export const toAudienceLabel = (audience: NotificationAudience) => {
  if (audience === notificationAudienceEnum.allUsers) {
    return "全員";
  }
  if (audience === notificationAudienceEnum.selectedUsers) {
    return "指定ユーザー";
  }
  return "すべて";
};

export const toTypeLabel = (type: NotificationType) => {
  return type === "all" ? "すべて" : type.toUpperCase();
};

export const toStatusLabel = (status: AdminNotificationRow["status"]) => {
  if (status === "archived") {
    return "アーカイブ";
  }
  if (status === "scheduled") {
    return "公開予約";
  }
  return "公開中";
};

export const toDateTimeLabel = (
  value:
    | AdminNotificationRow["createdAt"]
    | AdminNotificationRow["publishedAt"],
) => {
  if (value === null) {
    return "未設定";
  }
  return new Date(value).toLocaleString("ja-JP");
};
