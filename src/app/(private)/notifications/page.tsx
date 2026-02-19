import type { Metadata } from "next";
import type z from "zod";

import { definePrivatePage } from "../../../components/_common/page";
import { Footer } from "../../../components/notifications/footer";
import { Header } from "../../../components/notifications/header";
import { NotificationsList } from "../../../components/notifications/notification-list";
import { SearchForm } from "../../../components/notifications/search-form";
import {
  listQuerySchema,
  searchParamSchema,
} from "../../../schemas/notification";
import { listNotifications } from "../../../server/services/notificationService";

export const metadata: Metadata = {
  title: "Notification - Next.js Sample App",
};

const PAGE_SIZE = 10;

/**
 * 通知センター
 */
export default definePrivatePage<never, z.infer<typeof searchParamSchema>>({
  name: "notification",
}).page(async ({ props: { searchParams }, session }) => {
  const sp = searchParamSchema.safeParse(await searchParams).data;
  const query = listQuerySchema.parse({
    tab: sp?.tab ?? "unread",
    q: sp?.q ?? "",
    type: sp?.type ?? "all",
    page: Number(sp?.page ?? "1"),
    pageSize: PAGE_SIZE,
  } satisfies z.infer<typeof listQuerySchema>);

  const { total, unreadCount, items } = await listNotifications(
    session.user.id,
    query,
  );

  return (
    <main className="mx-auto min-w-xs max-w-2xl md:w-2xl p-3 md:p-6 space-y-4">
      <Header unreadCount={unreadCount} ids={items.map((item) => item.id)} />
      <SearchForm searchParams={query} unreadCount={unreadCount} />
      <NotificationsList items={items} />
      <Footer
        total={total}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        searchParams={query}
      />
    </main>
  );
});
