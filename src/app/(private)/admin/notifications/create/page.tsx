import type { Metadata } from "next";

import { definePrivatePage } from "../../../../../components/_common/page";
import { NewNotificationForm } from "../../../../../components/admin/notifications/new-notification-form";
import { getUsersForNotificationTarget } from "../../../../../server/services/userService";

export const metadata: Metadata = {
  title: "Notification Create Page - Next.js Sample App",
};

/**
 * 通知新規作成ページ
 */
export default definePrivatePage({
  adminOnly: true,
  name: "create_notification",
}).page(async () => {
  const usersPromise = getUsersForNotificationTarget();
  return <NewNotificationForm usersPromise={usersPromise} />;
});
