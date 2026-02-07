"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useId } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { changePassword, resetPassword } from "../../actions/auth";
import {
  type ChangePasswordSchema,
  changePasswordSchema,
  changePasswordSchemaKeys,
  type ResetPasswordSchema,
  resetPasswordSchemaKeys,
} from "../../schemas/auth";
import { useEnv } from "../_context/envContext";

const useFormIds = (): Record<keyof ResetPasswordSchema, string> => {
  const emailHintId = useId();
  return {
    email: emailHintId,
  };
};

const PasswordReminder = () => {
  const initialState = {
    error: "",
    formData: new FormData(),
  };

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await resetPassword(_, formData);
      if (result.success) {
        window.alert("メールを送信しました。");
      }
      return result;
    },
    initialState,
  );

  const formIds = useFormIds();
  const envStore = useEnv();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form action={formAction} autoComplete="on">
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
          <h2 className="card-title justify-center mb-2">パスワードの初期化</h2>
          {state.success ? (
            <>
              <div className="text-success text-sm">初期化メール送信済み</div>
              <p className="text-sm mt-2">
                メールが届いていない場合は、もう一度やり直してください。
              </p>
            </>
          ) : (
            <>
              <label className="label" htmlFor={formIds.email}>
                メールアドレス
              </label>
              <input
                id={formIds.email}
                className="input w-full"
                type="email"
                name={resetPasswordSchemaKeys.email}
                defaultValue={
                  (state.formData.get(resetPasswordSchemaKeys.email) as
                    | string
                    | null) ?? ""
                }
                placeholder="メールアドレス"
                required
                autoComplete="email"
              />
              {state.error && (
                <div className="text-error text-sm">{state.error}</div>
              )}
              <p className="label text-wrap">
                {`確定ボタンを押すと ${envStore.AWS_SES_FROM_EMAIL} からパスワード初期化URLの記載されたメールが送信されます。`}
              </p>
              <button
                type="submit"
                className="btn btn-primary mt-2"
                disabled={isPending}
              >
                確定
              </button>
            </>
          )}
          <a href="/sign-in" className="link link-primary mt-2">
            ログインページに戻る
          </a>
        </fieldset>
      </form>
    </div>
  );
};

const useChangePasswordFormFormIds = (): Record<
  keyof ChangePasswordSchema,
  string
> => {
  const passwordHintId = useId();
  const confirmNewPasswordHintId = useId();
  return {
    newPassword: passwordHintId,
    confirmNewPassword: confirmNewPasswordHintId,
  };
};

const ChangePasswordForm = ({ token }: { token: string }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit: SubmitHandler<ChangePasswordSchema> = async (data) => {
    try {
      const result = await changePassword(token, data);
      if (result?.success) {
        window.alert("更新しました");
      } else {
        window.alert("更新に失敗しました");
      }
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`更新に失敗しました。: ${error.message}`);
      }
    }
  };
  const formIds = useChangePasswordFormFormIds();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="on">
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
          <h2 className="card-title justify-center mb-2">パスワードの初期化</h2>
          {isSubmitSuccessful ? (
            <div className="text-success text-sm">初期化済み</div>
          ) : (
            <>
              <fieldset className="fieldset">
                <label className="label" htmlFor={formIds.newPassword}>
                  新しいパスワード
                </label>
                <input
                  className={`input ${errors.newPassword ? "input-error" : ""} w-full`}
                  type="password"
                  {...register(changePasswordSchemaKeys.newPassword)}
                  placeholder="新しいパスワード"
                  required
                  autoComplete="new-password"
                />
                {errors.newPassword && (
                  <p className="text-error text-xs">
                    {errors.newPassword.message}
                  </p>
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
                  {...register(changePasswordSchemaKeys.confirmNewPassword)}
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
            </>
          )}
          <a href="/sign-in" className="link link-primary mt-2">
            ログインページに戻る
          </a>
        </fieldset>
      </form>
    </div>
  );
};
export const ResetPasswordForm = ({ token }: { token?: string }) => {
  return token ? <ChangePasswordForm token={token} /> : <PasswordReminder />;
};
