"use client";

import { useActionState, useId } from "react";

import { resetPassword } from "../../actions/auth";
import {
  type ResetPasswordSchema,
  resetPasswordSchemaKeys,
} from "../../schemas/auth";

const useFormIds = (): Record<keyof ResetPasswordSchema, string> => {
  const emailHintId = useId();
  return {
    email: emailHintId,
  };
};

export const PasswordResetForm = () => {
  const initialState = {
    error: "",
    formData: new FormData(),
  };

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await resetPassword(_, formData);
      if (result.success) {
        window.alert("パスワードを初期化してメールを送信しました。");
      }
      return result;
    },
    initialState,
  );

  const formIds = useFormIds();
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
