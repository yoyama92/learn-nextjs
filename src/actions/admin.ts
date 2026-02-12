"use server";

import { headers } from "next/headers";

import { auth } from "../lib/auth";
import { definePrivateAction } from "../lib/define-action";
import {
  type CreateUserSchema,
  createUserSchema,
  type DeleteUserSchema,
  deleteUserSchema,
  type EditUserSchema,
  editUserSchema,
  type GetPaginationSchema,
  getPaginationSchema,
} from "../schemas/admin";
import { createUser, getUsersPaginated } from "../server/services/userService";

/**
 * ユーザーを追加する。
 * @param user 追加するユーザー情報
 * @returns メール送信成否。メール送信以外でエラーが発生した場合はnullを返す。
 */
export const postNewUser = definePrivateAction(
  async function postNewUser(user: CreateUserSchema) {
    const data = createUserSchema.parse(user);
    return await createUser({
      name: data.name,
      email: data.email,
      isAdmin: data.isAdmin,
    });
  },
  {
    // 管理者のみがこのアクションを実行できるようにする
    adminOnly: true,
  },
);

/**
 * ユーザーを削除する。
 * @param user 削除するユーザー情報
 * @returns 削除結果
 */
export const postDeleteUser = definePrivateAction(
  async function postDeleteUser(user: DeleteUserSchema, session) {
    const id = session.user.id;
    if (id === user.id) {
      return {
        success: false,
        message: "自分自身は削除できません。",
      };
    }
    const data = deleteUserSchema.parse(user);
    const result = await auth.api.removeUser({
      body: {
        userId: data.id,
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
  },
  {
    // 管理者のみがこのアクションを実行できるようにする
    adminOnly: true,
  },
);

/**
 * ユーザーを更新する。
 * @param user 更新するユーザー情報
 * @returns 成功か否か
 */
export const postEditUser = definePrivateAction(
  async function postEditUser(user: EditUserSchema) {
    const data = editUserSchema.parse(user);
    await auth.api.adminUpdateUser({
      body: {
        userId: user.id,
        data: {
          name: data.name,
          email: data.email,
          role: data.isAdmin ? "admin" : "user",
        },
      },
      headers: await headers(),
    });

    return {
      success: true,
    };
  },
  {
    // 管理者のみがこのアクションを実行できるようにする
    adminOnly: true,
  },
);

export const getUsers = definePrivateAction(
  async function getUsers(pagination: GetPaginationSchema) {
    const data = getPaginationSchema.parse(pagination);
    return await getUsersPaginated(data.page, data.pageSize);
  },
  {
    adminOnly: true,
  },
);
