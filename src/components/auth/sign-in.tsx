"use client";

import { useActionState, useId } from "react";

import { signIn } from "@/actions/auth";
import { signInSchemaKeys } from "@/schemas/auth";

export const SignIn = () => {
  const initialState = {
    error: "",
    formData: new FormData(),
  };

  const [state, formAction, isPending] = useActionState(signIn, initialState);

  const emailHintId = useId();
  const passwordHintId = useId();
  return (
    <form action={formAction} autoComplete="on">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
        <h2 className="card-title justify-center mb-2">
          Signin to your account
        </h2>
        <label className="label" htmlFor={emailHintId}>
          Email
        </label>
        <input
          id={emailHintId}
          className="input w-full"
          type="email"
          name={signInSchemaKeys.email}
          defaultValue={
            (state.formData.get(signInSchemaKeys.email) as string | null) ?? ""
          }
          placeholder="email"
          required
          autoComplete="email"
        />
        <label className="label mt-1" htmlFor={passwordHintId}>
          Password
        </label>
        <input
          id={passwordHintId}
          className="input w-full"
          type="password"
          name={signInSchemaKeys.password}
          defaultValue={
            (state.formData.get(signInSchemaKeys.password) as string | null) ??
            ""
          }
          required
          placeholder="password"
          autoComplete="password"
        />
        {state.error && <div className="text-error text-sm">{state.error}</div>}
        <button
          type="submit"
          className="btn btn-primary mt-2"
          disabled={isPending}
        >
          Sign In
        </button>
        <a href="/password-reset" className="link link-primary mt-2">
          Forgot your password?
        </a>
      </fieldset>
    </form>
  );
};
