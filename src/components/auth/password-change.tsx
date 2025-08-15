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
        window.alert(`Error updating user: ${error.message}`);
      }
    }
  };

  const formIds = useFormIds();
  return (
    <div className="flex justify-center items-center flex-1">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="on">
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
          <h2 className="card-title justify-center mb-2">
            Change your account password
          </h2>
          <input
            type="hidden"
            name="email"
            autoComplete="email"
            value={user.email}
            readOnly
          />
          <fieldset className="fieldset">
            <label className="label" htmlFor={formIds.currentPassword}>
              Current Password
            </label>
            <input
              id={formIds.currentPassword}
              className={`input ${errors.currentPassword ? "input-error" : ""} w-full`}
              type="password"
              {...register(passwordChangeSchemaKeys.currentPassword)}
              placeholder="current password"
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
              New Password
            </label>
            <input
              id={formIds.newPassword}
              className={`input ${errors.newPassword ? "input-error" : ""} w-full`}
              type="password"
              {...register(passwordChangeSchemaKeys.newPassword)}
              placeholder="new password"
              required
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="text-error text-xs">{errors.newPassword.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <label className="label" htmlFor={formIds.confirmNewPassword}>
              Confirm New Password
            </label>
            <input
              id={formIds.confirmNewPassword}
              className={`input ${errors.confirmNewPassword ? "input-error" : ""} w-full`}
              type="password"
              {...register(passwordChangeSchemaKeys.confirmNewPassword)}
              placeholder="confirm new password"
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
            Send Password Change Request
          </button>
          <Link href="/account" className="link link-primary mt-2">
            Back to Account
          </Link>
        </fieldset>
      </form>
    </div>
  );
};
