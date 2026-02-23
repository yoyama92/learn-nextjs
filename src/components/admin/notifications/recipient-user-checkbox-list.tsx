"use client";

import { use } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { NotificationTargetUser } from "../../../schemas/admin-notification";

/**
 * ユーザー一覧PromiseをSuspenseで解決し、対象ユーザー選択用チェックボックスだけを描画する。
 * @param props.usersPromise ユーザー一覧を返すPromise。
 * @param props.registerReturn react-hook-formのrecipientUserIds用register戻り値。
 * @param props.isSubmitting 送信中フラグ。trueの間はチェック操作を無効化する。
 */
export const RecipientUserCheckboxList = ({
  usersPromise,
  registerReturn,
  isSubmitting,
  error,
}: {
  usersPromise: Promise<NotificationTargetUser[]>;
  registerReturn: UseFormRegisterReturn<"recipientUserIds">;
  isSubmitting: boolean;
  error?: string;
}) => {
  const users = use(usersPromise);

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="max-h-56 overflow-y-auto rounded-box border border-base-300 p-2">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {users.map((user) => (
            <label
              key={user.id}
              className="label cursor-pointer justify-start gap-3 rounded-btn px-2 py-1"
            >
              <input
                type="checkbox"
                value={user.id}
                className="checkbox checkbox-sm checkbox-primary"
                {...registerReturn}
                disabled={isSubmitting}
              />
              <span
                className={`label-text ${isSubmitting ? "" : "text-base-content"}`}
              >
                {user.name} ({user.email})
              </span>
            </label>
          ))}
        </div>
      </div>
      {error && <p className="text-error text-lg pl-2">{error}</p>}
    </div>
  );
};
