"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "../lib/auth";
import {
  type ChangePasswordSchema,
  changePasswordSchema,
  resetPasswordSchema,
  sendVerificationEmailSchema,
  signInSchema,
} from "../schemas/auth";

/**
 * サインイン
 * @param _ 使わない
 * @param formData
 * @returns
 */
export const signIn = async (_: unknown, formData: FormData) => {
  const parseResult = signInSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parseResult.success) {
    return {
      error: "メールアドレスもしくはパスワードが異なります。",
      formData: formData,
    };
  }

  let result: Awaited<ReturnType<typeof auth.api.signInEmail>> | null = null;
  try {
    result = await auth.api.signInEmail({
      body: parseResult.data,
      headers: await headers(),
    });
  } catch (error) {
    // サインインに失敗した場合
    if (error instanceof APIError) {
      if (error.status === "UNAUTHORIZED") {
        return {
          error: "メールアドレスもしくはパスワードが異なります。",
          status: error.status,
          formData: formData,
        };
      } else if (error.status === "FORBIDDEN") {
        return {
          error: "メールアドレスが認証されていません。",
          status: error.status,
          formData: formData,
        };
      } else {
        return {
          error: "システムエラーが発生しました。",
          formData: formData,
        };
      }
    } else {
      return {
        error: "システムエラーが発生しました。",
        formData: formData,
      };
    }
  }

  if (result.user.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/account");
  }
};

/**
 * サインアウト
 */
export const signOut = async () => {
  const result = await auth.api.signOut({
    headers: await headers(),
  });
  if (result.success) {
    redirect("/sign-in");
  }
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

  if (!parseResult.success || !parseResult.data.email) {
    return {
      error: "メールアドレスを入力してください。",
      formData: formData,
    };
  }

  try {
    const data = await auth.api.requestPasswordReset({
      body: {
        email: parseResult.data.email,
      },
    });

    return {
      success: data.status,
      error: !data.status ? "パスワードの初期化に失敗しました。" : undefined,
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

export const sendVerificationEmail = async (_: unknown, formData: FormData) => {
  const parseResult = sendVerificationEmailSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parseResult.success) {
    return {
      success: false,
      formData: formData,
    };
  }
  const sendEmailResult = await auth.api.sendVerificationEmail({
    body: {
      email: parseResult.data.email,
    },
  });
  return {
    success: sendEmailResult.status,
    formData: formData,
  };
};
