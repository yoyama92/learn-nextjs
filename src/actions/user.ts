"use server";

import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { authHandler } from "../lib/session";
import type { PasswordChangeSchema, UserSchema } from "../schemas/user";

/**
 * ユーザー情報を更新する
 * @param user ユーザー情報
 * @returns 更新結果
 */
export const postUser = async (user: UserSchema) => {
  return authHandler(async () => {
    try {
      return await auth.api.updateUser({
        body: {
          name: user.name,
        },
        headers: await headers(),
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating user:", error.message);
      }
      return null;
    }
  });
};

/**
 * パスワードを更新する。
 * @param input 更新内容
 * @returns 更新結果
 */
export const changePassword = async (input: PasswordChangeSchema) => {
  return authHandler(async () => {
    if (input.newPassword !== input.confirmNewPassword) {
      return { success: false };
    }
    try {
      await auth.api.changePassword({
        body: {
          newPassword: input.newPassword,
          currentPassword: input.currentPassword,
          revokeOtherSessions: true,
        },
        headers: await headers(),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  });
};
