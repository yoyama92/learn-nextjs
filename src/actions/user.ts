"use server";

import { headers } from "next/headers";
import z from "zod";

import { auth } from "../lib/auth";
import { definePrivateAction } from "../lib/define-action";
import { passwordChangeSchema, userSchema } from "../schemas/user";

/**
 * ユーザー情報を更新する
 * @param user ユーザー情報
 * @returns 更新結果
 */
export const postUser = definePrivateAction({
  input: userSchema,
  output: z.object({
    status: z.boolean(),
  }),
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
  output: z.object({
    success: z.literal(true),
  }),
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
