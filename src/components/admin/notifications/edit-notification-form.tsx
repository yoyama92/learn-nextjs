"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { type SubmitHandler, useForm, useWatch } from "react-hook-form";

import { postEditNotification } from "../../../actions/admin";
import {
  type EditNotificationFormInputSchema,
  type EditNotificationFormSchema,
  editNotificationFormSchema,
  notificationAudienceEnum,
} from "../../../schemas/admin-notification";
import { PromiseReady } from "../../_common/promise-ready";
import { RecipientUserCheckboxList } from "./recipient-user-checkbox-list";

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
  const [isUsersLoaded, setIsUsersLoaded] = useState(false);
  const router = useRouter();
  const form = useForm<
    EditNotificationFormInputSchema,
    unknown,
    EditNotificationFormSchema
  >({
    resolver: zodResolver(editNotificationFormSchema),
    defaultValues: {
      title: notification.title,
      body: notification.body,
      type: notification.type,
      audience: notification.audience,
      recipientUserIds: notification.recipientUserIds,
      publishedAt: notification.publishedAt,
      archivedAt: notification.archivedAt,
      clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const onSubmit: SubmitHandler<EditNotificationFormSchema> = async (data) => {
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
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const selectedAudience = useWatch({
    control: control,
    name: "audience",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">通知編集</h2>
      <div className="card bg-base-100">
        <div className="card-body">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">対象</legend>
            <div className="join">
              <input
                id="audience-all"
                type="radio"
                value={notificationAudienceEnum.allUsers}
                className="btn join-item"
                aria-label="全員"
                {...register("audience")}
                disabled={isSubmitting}
              />
              <input
                id="audience-selected"
                type="radio"
                value={notificationAudienceEnum.selectedUsers}
                className="btn join-item"
                aria-label="指定ユーザー"
                {...register("audience")}
                disabled={isSubmitting}
              />
            </div>
            {selectedAudience === notificationAudienceEnum.selectedUsers && (
              <Suspense
                fallback={
                  <div className="mt-2 rounded border border-base-300 p-3 text-sm text-base-content/70">
                    ユーザー一覧を読み込み中...
                  </div>
                }
              >
                <RecipientUserCheckboxList
                  usersPromise={usersPromise}
                  registerReturn={register("recipientUserIds")}
                  isSubmitting={isSubmitting}
                  error={errors.recipientUserIds?.message}
                />
              </Suspense>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">種別</legend>
            <select
              className="select"
              {...register("type")}
              disabled={isSubmitting}
            >
              <option value="info">info</option>
              <option value="warn">warn</option>
              <option value="security">security</option>
            </select>
            {errors.type?.message && (
              <p className="text-error text-xs">{errors.type.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">タイトル</legend>
            <input
              className={`input w-full ${errors.title ? "input-error" : ""}`}
              {...register("title")}
              disabled={isSubmitting}
            />
            {errors.title?.message && (
              <p className="text-error text-xs">{errors.title.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">本文</legend>
            <textarea
              className={`textarea w-full h-40 ${errors.body ? "textarea-error" : ""}`}
              {...register("body")}
              disabled={isSubmitting}
            />
            {errors.body?.message && (
              <p className="text-error text-xs">{errors.body.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">公開日時</legend>
            <input
              type="datetime-local"
              className={`input ${errors.publishedAt ? "input-error" : ""}`}
              {...register("publishedAt")}
              disabled={isSubmitting}
            />
            {errors.publishedAt?.message && (
              <p className="text-error text-xs">{errors.publishedAt.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">アーカイブ日時</legend>
            <input
              type="datetime-local"
              className={`input ${errors.archivedAt ? "input-error" : ""}`}
              {...register("archivedAt")}
              disabled={isSubmitting}
            />
            {errors.archivedAt?.message && (
              <p className="text-error text-xs">{errors.archivedAt.message}</p>
            )}
          </fieldset>
          <input type="hidden" {...register("clientTimeZone")} />
        </div>
      </div>

      <div className="flex flex-row justify-end gap-2">
        <Suspense fallback={null}>
          <PromiseReady
            promise={usersPromise}
            onReady={() => {
              setIsUsersLoaded(true);
            }}
          />
        </Suspense>
        <Link href="/admin/notifications" className="btn btn-outline">
          一覧に戻る
        </Link>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isSubmitting || !isUsersLoaded}
        >
          {isSubmitting ? "更新中..." : !isUsersLoaded ? "読込中..." : "更新"}
        </button>
      </div>
    </form>
  );
};
