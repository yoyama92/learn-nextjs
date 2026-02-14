"use server";

import { headers } from "next/headers";
import z from "zod";

import { auth } from "../lib/auth";
import { defineAdminAction } from "../lib/define-action";
import {
  createUserSchema,
  deleteUserSchema,
  editUserSchema,
  getPaginationSchema,
} from "../schemas/admin";
import { createUser, getUsersPaginated } from "../server/services/userService";

/**
 * ユーザーを追加する。
 * @param user 追加するユーザー情報
 * @returns メール送信成否。メール送信以外でエラーが発生した場合はnullを返す。
 */
export const postNewUser = defineAdminAction({
  input: createUserSchema,
  output: z.object({
    mailSent: z.boolean(),
  }),
  name: "admin_post_new_user",
}).handler(async ({ input }) => {
  return await createUser(input);
});

/**
 * ユーザーを削除する。
 * @param user 削除するユーザー情報
 * @returns 削除結果
 */
export const postDeleteUser = defineAdminAction({
  input: deleteUserSchema,
  output: z.discriminatedUnion("success", [
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
    z.object({
      success: z.literal(true),
    }),
  ]),
  name: "admin_post_delete_user",
}).handler(async ({ ctx, input }) => {
  const id = ctx.session.user.id;
  if (id === input.id) {
    return {
      success: false,
      message: "自分自身は削除できません。",
    };
  }

  const result = await auth.api.removeUser({
    body: {
      userId: input.id,
    },
    headers: await headers(),
  });
  if (result.success) {
    return {
      success: true,
    };
  } else {
    return {
      success: false,
      message: "削除に失敗しました。",
    };
  }
});

/**
 * ユーザーを更新する。
 * @param user 更新するユーザー情報
 * @returns 成功か否か
 */
export const postEditUser = defineAdminAction({
  input: editUserSchema,
  output: z.object({
    success: z.literal(true),
  }),
  name: "admin_post_edit_user",
}).handler(async ({ input }) => {
  await auth.api.adminUpdateUser({
    body: {
      userId: input.id,
      data: {
        name: input.name,
        email: input.email,
        role: input.isAdmin ? "admin" : "user",
      },
    },
    headers: await headers(),
  });

  return {
    success: true,
  };
});

export const getUsers = defineAdminAction({
  input: getPaginationSchema,
  output: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        role: z.string().nullable(),
      }),
    ),
    total: z.number().positive(),
    pageSize: z.number().positive(),
    totalPages: z.number().positive(),
    currentPage: z.number().positive(),
  }),
  name: "admin_get_users",
}).handler(async ({ input }) => {
  const result = await getUsersPaginated(input.page, input.pageSize);
  return {
    ...result,
    users: result.users.map((user) => {
      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.createdAt.toISOString(),
      };
    }),
  };
});
