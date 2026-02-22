import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { definePrivatePage } from "../../../../../components/_common/page";
import { NotificationDetail } from "../../../../../components/admin/notifications/notification-detail";
import { z } from "../../../../../lib/zod";
import { getAdminNotificationDetailById } from "../../../../../server/services/notificationService";

export const metadata: Metadata = {
  title: "Notification Detail Page - Next.js Sample App",
};

const paramsSchema = z.object({
  id: z.uuidv4(),
});

type Params = z.infer<typeof paramsSchema>;

export default definePrivatePage<Params>({
  adminOnly: true,
  name: "admin_notification_detail",
}).page(async ({ props: { params } }) => {
  const data = paramsSchema.safeParse(await params).data;
  const id = data?.id;
  if (!id) {
    notFound();
  }

  const notification = await getAdminNotificationDetailById(id);
  if (!notification) {
    notFound();
  }

  return (
    <NotificationDetail
      notification={{
        id: notification.id,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        audience: notification.audience,
        publishedAt: notification.publishedAt,
        archivedAt: notification.archivedAt,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        status: notification.status,
        recipients: notification.recipients.map((recipient) => ({
          userId: recipient.userId,
          name: recipient.user.name,
          email: recipient.user.email,
          readAt: recipient.readAt,
        })),
      }}
    />
  );
});
