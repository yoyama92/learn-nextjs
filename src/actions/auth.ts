"use server";

import { redirect } from "next/navigation";
import { CredentialsSignin } from "next-auth";

import { signIn as auth, signOut as signOutFn } from "@/lib/auth";
import { signInSchema } from "@/schemas/auth";
import { passwordReminder } from "@/server/services/authService";

export const signIn = async (
  _: unknown,
  formData: FormData,
): Promise<{
  error?: string;
  formData: FormData;
}> => {
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

    await auth("credentials", {
      ...parseResult.data,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return {
        error: "メールアドレスもしくはパスワードが異なります。",
        formData: formData,
      };
    } else {
      return { error: "システムエラーが発生しました。", formData: formData };
    }
  }

  redirect("/");
};

export const signOut = async () => {
  return await signOutFn({
    redirect: true,
    redirectTo: "/sign-in",
  });
};

export const resetPassword = async (
  _: unknown,
  formData: FormData,
): Promise<{
  success?: boolean;
  error?: string;
  formData: FormData;
}> => {
  const email = formData.get("email")?.toString();

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
