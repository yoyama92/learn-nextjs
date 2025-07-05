"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type * as z from "zod/v4";

import { changePassword } from "@/actions/user";
import { passwordChangeSchema, passwordChangeSchemaKeys } from "@/lib/zod";

export const PasswordChangeForm = ({
  user,
}: {
  user: {
    email: string;
  };
}) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof passwordChangeSchema>> = async (
    data,
  ) => {
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

  const currentPasswordHintId = useId();
  const passwordHintId = useId();
  const confirmNewPasswordHintId = useId();
  return (
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
          <label className="label" htmlFor={currentPasswordHintId}>
            Current Password
          </label>
          <input
            id={currentPasswordHintId}
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
          <label className="label" htmlFor={passwordHintId}>
            New Password
          </label>
          <input
            id={passwordHintId}
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
          <label className="label" htmlFor={confirmNewPasswordHintId}>
            Confirm New Password
          </label>
          <input
            id={confirmNewPasswordHintId}
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
  );
};
