"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "../lib/auth";
import { envStore } from "../lib/env";
import {
  type ChangePasswordSchema,
  changePasswordSchema,
  resetPasswordSchema,
  signInSchema,
} from "../schemas/auth";

/**
 * サインイン
 * @param _
 * @param formData
 * @returns
 */
export const signIn = async (_: unknown, formData: FormData) => {
  try {
    const parseResult = signInSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );

    if (!parseResult.success) {
      return {
        error: "メールアドレスもしくはパスワードが異なります。",
        formData: formData,
      };
    }

    await auth.api.signInEmail({
      body: parseResult.data,
      headers: await headers(),
    });
  } catch (error) {
    // サインインに失敗した場合
    if (error instanceof APIError && error.status === "UNAUTHORIZED") {
      return {
        error: "メールアドレスもしくはパスワードが異なります。",
        formData: formData,
      };
    } else {
      return { error: "システムエラーが発生しました。", formData: formData };
    }
  }

  // サインインに成功した場合
  redirect("/");
};

/**
 * サインアウト
 */
export const signOut = async () => {
  return await auth.api.signOut({
    headers: await headers(),
  });
};

/**
 * パスワードを初期化する。
 */
export const resetPassword = async (
  _: unknown,
  formData: FormData,
): Promise<{
  success?: boolean;
  error?: string;
  formData: FormData;
}> => {
  const parseResult = resetPasswordSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  const email = parseResult.data?.email;
  if (!email) {
    return { error: "メールアドレスを入力してください。", formData: formData };
  }

  try {
    const data = await auth.api.requestPasswordReset({
      body: {
        email: email,
        redirectTo: new URL(
          "/reset-password",
          envStore.BETTER_AUTH_URL,
        ).toString(),
      },
    });
    return {
      success: data.status,
      error: data.status ? "" : "パスワードの初期化に失敗しました。",
      formData: formData,
    };
  } catch {
    return {
      error: "システムエラーが発生しました。",
      formData: formData,
    };
  }
};

/**
 * パスワードを更新する。
 */
export const changePassword = async (
  token: string,
  formData: ChangePasswordSchema,
): Promise<{
  success?: boolean;
}> => {
  "use server";

  const parseResult = changePasswordSchema.safeParse(formData);
  if (parseResult.success === false) {
    return { success: false };
  }

  const data = parseResult.data;

  try {
    const result = await auth.api.resetPassword({
      body: {
        newPassword: data.newPassword,
        token: token,
      },
    });
    return {
      success: result.status,
    };
  } catch {
    return {
      success: false,
    };
  }
};
