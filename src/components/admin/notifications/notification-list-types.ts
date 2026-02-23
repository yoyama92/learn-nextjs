import {
  type AdminNotificationRow,
  type AdminNotificationSearchParams,
  type NotificationAudience,
  type NotificationStatus,
  notificationAudienceEnum,
} from "../../../schemas/admin-notification";
import type { NotificationType } from "../../../schemas/notification";

export type { AdminNotificationRow, AdminNotificationSearchParams };

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

export const toStatusLabel = (status: NotificationStatus) => {
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
