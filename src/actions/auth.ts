"use server";

import { redirect } from "next/navigation";
import { CredentialsSignin } from "next-auth";

import { signIn as auth, signOut as signOutFn } from "@/lib/auth";
import { signInSchema } from "@/lib/zod";

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

    await auth(
      "credentials",
      {
        ...parseResult.data,
        redirect: false,
      },
    );
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
