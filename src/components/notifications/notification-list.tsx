import type { NotificationType } from "../../schemas/notification";
import { NotificationItem } from "./notification-item";

export const NotificationsList = ({
  items,
}: {
  items: {
    type: NotificationType;
    title: string;
    body: string;
    createdAt: Date;
    id: string;
    readAt: Date | null;
  }[];
}) => {
  return (
    <section className="space-y-3">
      {items.length === 0 ? (
        <div className="alert">
          <span>該当する通知がありません。</span>
        </div>
      ) : (
        items.map((item) => {
          return <NotificationItem key={item.id} item={item} />;
        })
      )}
    </section>
  );
};
