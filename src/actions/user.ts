"use server";

import { headers } from "next/headers";

import { auth } from "../lib/auth";
import { definePrivateAction } from "../lib/define-action";
import {
  type PasswordChangeSchema,
  passwordChangeSchema,
  type UserSchema,
  userSchema,
} from "../schemas/user";

/**
 * ユーザー情報を更新する
 * @param user ユーザー情報
 * @returns 更新結果
 */
export const postUser = definePrivateAction(
  async (user: UserSchema) => {
    const data = userSchema.parse(user);
    return await auth.api.updateUser({
      body: {
        name: data.name,
      },
      headers: await headers(),
    });
  },
  {
    actionName: "post_user",
  },
);

/**
 * パスワードを更新する。
 * @param input 更新内容
 * @returns 更新結果
 */
export const changePassword = definePrivateAction(
  async (input: PasswordChangeSchema) => {
    if (input.newPassword !== input.confirmNewPassword) {
      return {
        success: false,
      };
    }
    const { success, data } = passwordChangeSchema.safeParse(input);
    if (!success) {
      return {
        success: false,
      };
    }
    await auth.api.changePassword({
      body: {
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
    return {
      success: true,
    };
  },
  {
    actionName: "change_password",
  },
);
