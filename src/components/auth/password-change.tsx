"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { changePassword } from "../../actions/user";
import {
  type PasswordChangeSchema,
  passwordChangeSchema,
  passwordChangeSchemaKeys,
} from "../../schemas/user";

const useFormIds = (): Record<keyof PasswordChangeSchema, string> => {
  const currentPasswordHintId = useId();
  const passwordHintId = useId();
  const confirmNewPasswordHintId = useId();
  return {
    currentPassword: currentPasswordHintId,
    newPassword: passwordHintId,
    confirmNewPassword: confirmNewPasswordHintId,
  };
};

export const PasswordChangeForm = ({
  user,
}: {
  user: {
    email: string;
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeSchema>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const router = useRouter();
  const onSubmit: SubmitHandler<PasswordChangeSchema> = async (data) => {
    try {
      const result = await changePassword(data);
      if (result?.success) {
        window.alert("更新しました");
        router.push("/account");
      } else {
        window.alert("更新に失敗しました");
      }
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`更新に失敗しました。: ${error.message}`);
      }
    }
  };

  const formIds = useFormIds();
  return (
    <div className="flex justify-center items-center flex-1">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="on">
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
          <h2 className="card-title justify-center mb-2">パスワード変更</h2>
          <input
            type="hidden"
            name="email"
            autoComplete="email"
            value={user.email}
            readOnly
          />
          <fieldset className="fieldset">
            <label className="label" htmlFor={formIds.currentPassword}>
              現在のパスワード
            </label>
            <input
              id={formIds.currentPassword}
              className={`input ${errors.currentPassword ? "input-error" : ""} w-full`}
              type="password"
              {...register(passwordChangeSchemaKeys.currentPassword)}
              placeholder="現在のパスワード"
              required
              autoComplete="current-password"
            />
            {errors.currentPassword && (
              <p className="text-error text-xs">
                {errors.currentPassword.message}
              </p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <label className="label" htmlFor={formIds.newPassword}>
              新しいパスワード
            </label>
            <input
              id={formIds.newPassword}
              className={`input ${errors.newPassword ? "input-error" : ""} w-full`}
              type="password"
              {...register(passwordChangeSchemaKeys.newPassword)}
              placeholder="新しいパスワード"
              required
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="text-error text-xs">{errors.newPassword.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <label className="label" htmlFor={formIds.confirmNewPassword}>
              新しいパスワード（確認用）
            </label>
            <input
              id={formIds.confirmNewPassword}
              className={`input ${errors.confirmNewPassword ? "input-error" : ""} w-full`}
              type="password"
              {...register(passwordChangeSchemaKeys.confirmNewPassword)}
              placeholder=" 新しいパスワード（確認用）"
              required
              autoComplete="new-password"
            />
            {errors.confirmNewPassword && (
              <p className="text-error text-xs">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </fieldset>
          <button
            type="submit"
            className="btn btn-primary mt-2"
            disabled={isSubmitting}
          >
            パスワードを更新する
          </button>
          <Link href="/account" className="link link-primary mt-2">
            アカウントページに戻る
          </Link>
        </fieldset>
      </form>
    </div>
  );
};
