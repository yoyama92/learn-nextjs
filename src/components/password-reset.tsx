"use client";

import { useActionState, useId } from "react";

import { resetPassword } from "@/actions/auth";
import { signInSchemaKeys } from "@/lib/zod";

export const PasswordResetForm = () => {
  const initialState = {
    error: "",
    formData: new FormData(),
  };

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await resetPassword(_, formData);
      if (result.success) {
        window.alert("Password reset email sent successfully.");
      }
      return result;
    },
    initialState,
  );

  const emailHintId = useId();
  return (
    <form action={formAction} autoComplete="on">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
        <h2 className="card-title justify-center mb-2">
          Reset your account password
        </h2>
        {state.success ? (
          <>
            <div className="text-success text-sm">
              Password reset email sent successfully.
            </div>
            <p className="text-sm mt-2">
              If you do not receive the email, please check your spam folder or
              try again.
            </p>
          </>
        ) : (
          <>
            <label className="label" htmlFor={emailHintId}>
              Email
            </label>
            <input
              id={emailHintId}
              className="input w-full"
              type="email"
              name={signInSchemaKeys.email}
              defaultValue={
                (state.formData.get(signInSchemaKeys.email) as string | null) ??
                ""
              }
              placeholder="email"
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
              Send Password Reset Email
            </button>
          </>
        )}
        <a href="/sign-in" className="link link-primary mt-2">
          Back to Sign In
        </a>
      </fieldset>
    </form>
  );
};
