"use server";

import { redirect } from "next/navigation";
import { CredentialsSignin } from "next-auth";

import { signIn as auth, signOut as signOutFn } from "../lib/auth";
import {
  type Role,
  resetPasswordSchema,
  roleEnum,
  signInSchema,
} from "../schemas/auth";
import { passwordReminder } from "../server/services/authService";

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

    // Auth.jsの機能でサインインを行う。
    await auth(roleEnum.user, {
      ...parseResult.data,
      redirect: false,
    });
  } catch (error) {
    // サインインに失敗した場合は`CredentialsSignin`が投げられる。
    if (error instanceof CredentialsSignin) {
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
  return await signOutFn({
    redirect: true,
    redirectTo: "/sign-in",
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
    const result = await passwordReminder(email);
    return {
      success: result.success,
      error: result.success ? "" : "パスワードの初期化に失敗しました。",
      formData: formData,
    };
  } catch {
    return {
      error: "システムエラーが発生しました。",
      formData: formData,
    };
  }
};
