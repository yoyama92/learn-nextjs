"use server";

import { authHandler } from "@/lib/auth";
import type { PasswordChangeSchema, UserSchema } from "@/schemas/user";
import { updateUser, updateUserPassword } from "@/server/services/userService";

/**
 * ユーザー情報を更新する
 * @param user ユーザー情報
 * @returns 更新結果
 */
export const postUser = async (user: UserSchema) => {
  return authHandler(async (id) => {
    try {
      return await updateUser(id, {
        name: user.name,
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
  return authHandler(async (id) => {
    try {
      return await updateUserPassword(id, {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        confirmNewPassword: input.confirmNewPassword,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating user:", error.message);
      }
      return null;
    }
  });
};
