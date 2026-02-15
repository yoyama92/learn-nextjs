"use server";

import { headers } from "next/headers";

import { auth } from "../lib/auth";
import { definePrivateAction } from "../lib/define-action";
import {
  passwordChangeResponseSchema,
  passwordChangeSchema,
  postUserResponseSchema,
  userSchema,
} from "../schemas/user";

/**
 * ユーザー情報を更新する
 * @param user ユーザー情報
 * @returns 更新結果
 */
export const postUser = definePrivateAction({
  input: userSchema,
  output: postUserResponseSchema,
  name: "post_user",
}).handler(async ({ input }) => {
  return await auth.api.updateUser({
    body: {
      name: input.name,
    },
    headers: await headers(),
  });
});

/**
 * パスワードを更新する。
 * @param input 更新内容
 * @returns 更新結果
 */
export const changePassword = definePrivateAction({
  input: passwordChangeSchema,
  output: passwordChangeResponseSchema,
  name: "change_password",
}).handler(async ({ input }) => {
  await auth.api.changePassword({
    body: {
      newPassword: input.newPassword,
      currentPassword: input.currentPassword,
      revokeOtherSessions: true,
    },
    headers: await headers(),
  });
  return {
    success: true,
  };
});
