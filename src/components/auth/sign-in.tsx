"use client";

import { type ReactNode, useActionState, useId } from "react";

import { type SignInSchema, signInSchemaKeys } from "../../schemas/auth";

const useFormIds = (): Record<keyof SignInSchema, string> => {
  const emailHintId = useId();
  const passwordHintId = useId();
  return {
    email: emailHintId,
    password: passwordHintId,
  };
};

export const SignIn = ({
  title,
  buttonLabel,
  signIn,
  footer,
}: {
  title: string;
  buttonLabel: string;
  signIn: (
    _: unknown,
    formData: FormData,
  ) => Promise<{
    error?: string | undefined;
    formData: FormData;
  }>;
  footer?: ReactNode;
}) => {
  const initialState = {
    error: "",
    formData: new FormData(),
  };

  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const formIds = useFormIds();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form action={formAction} autoComplete="on">
        <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
          <h2 className="card-title justify-center mb-2">{title}</h2>
          <label className="label" htmlFor={formIds.email}>
            メールアドレス
          </label>
          <input
            id={formIds.email}
            className="input w-full"
            type="email"
            name={signInSchemaKeys.email}
            defaultValue={
              (state.formData.get(signInSchemaKeys.email) as string | null) ??
              ""
            }
            placeholder="メールアドレス"
            required
            autoComplete="email"
          />
          <label className="label mt-1" htmlFor={formIds.password}>
            パスワード
          </label>
          <input
            id={formIds.password}
            className="input w-full"
            type="password"
            name={signInSchemaKeys.password}
            defaultValue={
              (state.formData.get(signInSchemaKeys.password) as
                | string
                | null) ?? ""
            }
            required
            placeholder="パスワード"
            autoComplete="password"
          />
          {state.error && (
            <div className="text-error text-sm">{state.error}</div>
          )}
          <button
            type="submit"
            className="btn btn-primary mt-2"
            disabled={isPending}
          >
            {buttonLabel}
          </button>
          {footer}
        </fieldset>
      </form>
    </div>
  );
};
