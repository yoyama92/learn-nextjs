"use client";

import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";

import { postCreateNotification } from "../../../actions/admin-notification";
import {
  type NotificationFormSchema,
  notificationAudienceEnum,
} from "../../../schemas/admin-notification";
import { NotificationForm } from "./notification-form";

export const NewNotificationForm = ({
  usersPromise,
}: {
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
      const result = await postCreateNotification(data);
      if (result.success) {
        window.alert("作成に成功しました。");
        router.push(`/admin/notifications/${result.data.id}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`作成に失敗しました。: ${error.message}`);
        return;
      }
      window.alert("作成に失敗しました。");
    }
  };

  return (
    <NotificationForm
      title="通知作成"
      submitLabel="作成"
      submittingLabel="作成中..."
      defaultValues={{
        title: "",
        body: "",
        type: "info",
        audience: notificationAudienceEnum.allUsers,
        recipientUserIds: [],
        publishedAt: "",
        archivedAt: "",
        clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }}
      usersPromise={usersPromise}
      onSubmit={onSubmit}
    />
  );
};
