"use client";

import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";

import { postEditNotification } from "../../../actions/admin-notification";
import type { NotificationFormSchema } from "../../../schemas/admin-notification";
import { NotificationForm } from "./notification-form";

export const EditNotificationForm = ({
  notification,
  usersPromise,
}: {
  notification: {
    id: string;
    title: string;
    body: string;
    type: "info" | "warn" | "security";
    audience: "ALL" | "SELECTED";
    recipientUserIds: string[];
    publishedAt: string;
    archivedAt: string;
  };
  usersPromise: Promise<
    {
      id: string;
      name: string;
      email: string;
    }[]
  >;
}) => {
  const router = useRouter();

  const onSubmit: SubmitHandler<NotificationFormSchema> = async (data) => {
    try {
      const result = await postEditNotification({
        id: notification.id,
        ...data,
      });
      if (result.success) {
        window.alert("更新に成功しました。");
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`更新に失敗しました。: ${error.message}`);
        return;
      }
      window.alert("更新に失敗しました。");
    }
  };

  return (
    <NotificationForm
      title="通知編集"
      submitLabel="更新"
      submittingLabel="更新中..."
      defaultValues={{
        title: notification.title,
        body: notification.body,
        type: notification.type,
        audience: notification.audience,
        recipientUserIds: notification.recipientUserIds,
        publishedAt: notification.publishedAt,
        archivedAt: notification.archivedAt,
        clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }}
      usersPromise={usersPromise}
      onSubmit={onSubmit}
    />
  );
};
