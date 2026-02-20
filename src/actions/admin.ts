"use server";

import { headers } from "next/headers";

import { auth } from "../lib/auth";
import { defineAdminAction } from "../lib/define-action";
import {
  createUserResponseSchema,
  createUserSchema,
  deleteUserResponseSchema,
  deleteUserSchema,
  editUserResponseSchema,
  editUserSchema,
  getPaginationResponseSchema,
  getPaginationSchema,
} from "../schemas/admin";
import {
  deleteNotificationResponseSchema,
  deleteNotificationSchema,
} from "../schemas/admin-notification";
import { archiveNotificationByAdmin } from "../server/services/notificationService";
import { createUser, getUsersPaginated } from "../server/services/userService";

/**
 * ユーザーを追加する。
 * @param user 追加するユーザー情報
 * @returns メール送信成否。メール送信以外でエラーが発生した場合はnullを返す。
 */
export const postNewUser = defineAdminAction({
  input: createUserSchema,
  output: createUserResponseSchema,
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
  output: deleteUserResponseSchema,
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
  output: editUserResponseSchema,
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
  output: getPaginationResponseSchema,
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

export const postDeleteNotification = defineAdminAction({
  input: deleteNotificationSchema,
  output: deleteNotificationResponseSchema,
  name: "admin_post_delete_notification",
}).handler(async ({ input }) => {
  const result = await archiveNotificationByAdmin(input.id);
  if (result.updated > 0) {
    return {
      success: true,
    };
  }
  return {
    success: false,
    message: "対象の通知が見つからないか、すでにアーカイブ済みです。",
  };
});
