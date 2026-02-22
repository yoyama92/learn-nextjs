"use server";

import { tz } from "@date-fns/tz";
import { isValid, parseISO } from "date-fns";

import { defineAdminAction } from "../lib/define-action";
import {
  deleteNotificationResponseSchema,
  deleteNotificationSchema,
  editNotificationResponseSchema,
  editNotificationSchema,
} from "../schemas/admin-notification";
import {
  archiveNotificationByAdmin,
  editNotificationByAdmin,
} from "../server/services/notificationService";

export const postDeleteNotification = defineAdminAction({
  input: deleteNotificationSchema,
  output: deleteNotificationResponseSchema,
  name: "admin_post_delete_notification",
}).handler(async ({ input }) => {
  const result = await archiveNotificationByAdmin(input.id);
  if (result.updated > 0) {
    return {
      success: true,
    };
  }
  return {
    success: false,
    message: "対象の通知が見つからないか、すでにアーカイブ済みです。",
  };
});

export const postEditNotification = defineAdminAction({
  input: editNotificationSchema,
  output: editNotificationResponseSchema,
  name: "admin_post_edit_notification",
}).handler(async ({ input }) => {
  const toDate = (value: string, clientTimeZone: string): Date | null => {
    if (!value) {
      return null;
    }
    const zonedDate = parseISO(value, { in: tz(clientTimeZone) });
    const date = new Date(zonedDate.getTime());
    if (!isValid(date)) {
      throw new Error("日時の形式が不正です。");
    }

    return date;
  };

  const result = await editNotificationByAdmin({
    id: input.id,
    title: input.title,
    body: input.body,
    type: input.type,
    audience: input.audience,
    recipientUserIds: input.recipientUserIds,
    publishedAt: toDate(input.publishedAt, input.clientTimeZone),
    archivedAt: toDate(input.archivedAt, input.clientTimeZone),
  });

  if (result.updated === 0) {
    throw new Error("更新対象の通知が見つかりません。");
  }

  return {
    success: true,
  };
});
