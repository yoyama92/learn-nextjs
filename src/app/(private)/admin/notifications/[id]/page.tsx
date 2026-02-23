import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { definePrivatePage } from "../../../../../components/_common/page";
import { NotificationDetail } from "../../../../../components/admin/notifications/notification-detail";
import {
  type AdminNotificationIdParams,
  adminNotificationIdParamsSchema,
} from "../../../../../schemas/route-params";
import { getAdminNotificationDetailById } from "../../../../../server/services/notificationService";

export const metadata: Metadata = {
  title: "Notification Detail Page - Next.js Sample App",
};

export default definePrivatePage<AdminNotificationIdParams>({
  adminOnly: true,
  name: "admin_notification_detail",
}).page(async ({ props: { params } }) => {
  const data = adminNotificationIdParamsSchema.safeParse(await params).data;
  const id = data?.id;
  if (!id) {
    notFound();
  }

  const notification = await getAdminNotificationDetailById(id);
  if (!notification) {
    notFound();
  }

  return (
    <NotificationDetail notification={notification} />
  );
});
