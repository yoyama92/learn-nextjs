"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Suspense, useState } from "react";
import { type SubmitHandler, useForm, useWatch } from "react-hook-form";

import {
  type NotificationFormInputSchema,
  type NotificationFormSchema,
  notificationAudienceEnum,
  notificationFormSchema,
} from "../../../schemas/admin-notification";
import { PromiseReady } from "../../_common/promise-ready";
import { RecipientUserCheckboxList } from "./recipient-user-checkbox-list";

export const NotificationForm = ({
  title,
  submitLabel,
  submittingLabel,
  defaultValues,
  usersPromise,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  submittingLabel: string;
  defaultValues: NotificationFormInputSchema;
  usersPromise: Promise<
    {
      id: string;
      name: string;
      email: string;
    }[]
  >;
  onSubmit: SubmitHandler<NotificationFormSchema>;
}) => {
  const [isUsersLoaded, setIsUsersLoaded] = useState(false);
  const form = useForm<
    NotificationFormInputSchema,
    unknown,
    NotificationFormSchema
  >({
    resolver: zodResolver(notificationFormSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const selectedAudience = useWatch({
    control,
    name: "audience",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">{title}</h2>
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
          {isSubmitting
            ? submittingLabel
            : !isUsersLoaded
              ? "読込中..."
              : submitLabel}
        </button>
      </div>
    </form>
  );
};
