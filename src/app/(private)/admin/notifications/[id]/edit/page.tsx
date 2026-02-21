import { format } from "date-fns";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { definePrivatePage } from "../../../../../../components/_common/page";
import { EditNotificationForm } from "../../../../../../components/admin/edit-notification-form";
import { z } from "../../../../../../lib/zod";
import { getAdminNotificationById } from "../../../../../../server/services/notificationService";
import { getUsersForNotificationTarget } from "../../../../../../server/services/userService";

export const metadata: Metadata = {
  title: "Notification Edit Page - Next.js Sample App",
};

const paramsSchema = z.object({
  id: z.uuidv4(),
});

type Params = z.infer<typeof paramsSchema>;

const toDateTimeLocalValue = (value: Date | null): string => {
  if (!value) {
    return "";
  }
  return format(value, "yyyy-MM-dd'T'HH:mm");
};

export default definePrivatePage<Params>({
  adminOnly: true,
  name: "admin_notification_edit",
}).page(async ({ props: { params } }) => {
  const { id } = paramsSchema.parse(await params);
  const [notification, users] = await Promise.all([
    getAdminNotificationById(id),
    getUsersForNotificationTarget(),
  ]);
  if (!notification) {
    notFound();
  }

  return (
    <main className="mx-auto w-full min-w-xs max-w-5xl p-3 md:p-6">
      <EditNotificationForm
        notification={{
          id: notification.id,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          audience: notification.audience,
          recipientUserIds: notification.recipients.map((item) => item.userId),
          publishedAt: toDateTimeLocalValue(notification.publishedAt),
          archivedAt: toDateTimeLocalValue(notification.archivedAt),
        }}
        users={users}
      />
    </main>
  );
});
