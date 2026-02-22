import type { Metadata } from "next";
import type z from "zod";

import { definePrivatePage } from "../../../../components/_common/page";
import { AdminNotificationList } from "../../../../components/admin/notifications/notification-list";
import {
  adminNotificationListQuerySchema,
  adminNotificationSearchParamSchema,
  notificationArchiveFilterEnum,
  notificationAudienceEnum,
} from "../../../../schemas/admin-notification";
import { listAdminNotifications } from "../../../../server/services/notificationService";

export const metadata: Metadata = {
  title: "Admin Notification - Next.js Sample App",
};

const PAGE_SIZE = 10;

export default definePrivatePage<
  never,
  z.infer<typeof adminNotificationSearchParamSchema>
>({
  adminOnly: true,
  name: "admin_notification_list",
}).page(async ({ props: { searchParams } }) => {
  const sp = adminNotificationSearchParamSchema.safeParse(
    await searchParams,
  ).data;

  const query = adminNotificationListQuerySchema.parse({
    q: sp?.q ?? "",
    type: sp?.type ?? "all",
    audience: sp?.audience ?? notificationAudienceEnum.all,
    archived: sp?.archived ?? notificationArchiveFilterEnum.active,
    page: Number(sp?.page ?? "1"),
    pageSize: PAGE_SIZE,
  } satisfies z.infer<typeof adminNotificationListQuerySchema>);

  const { total, items } = await listAdminNotifications(query);

  return (
    <main className="mx-auto w-full min-w-xs max-w-6xl xl:w-6xl p-3 md:p-6">
      <AdminNotificationList
        items={items}
        total={total}
        searchParams={{
          q: query.q,
          type: query.type,
          audience: query.audience,
          archived: query.archived,
          page: query.page,
        }}
        pageSize={PAGE_SIZE}
      />
    </main>
  );
});
