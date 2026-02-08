"use server";

import { headers } from "next/headers";

import { auth } from "../lib/auth";
import { authHandler } from "../lib/session";
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
export const postNewUser = async (
  user: CreateUserSchema,
): Promise<{
  mailSent: boolean;
} | null> => {
  return authHandler(
    async () => {
      try {
        const data = createUserSchema.parse(user);
        return await createUser({
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error updating user:", error.message);
        }
        return null;
      }
    },
    {
      // 管理者のみがこのアクションを実行できるようにする
      adminOnly: true,
    },
  );
};

/**
 * ユーザーを削除する。
 * @param user 削除するユーザー情報
 * @returns 削除結果
 */
export const postDeleteUser = async (
  user: DeleteUserSchema,
): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    }
> => {
  return authHandler(
    async (id) => {
      if (id === user.id) {
        return {
          success: false,
          message: "自分自身は削除できません。",
        };
      }
      try {
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
      } catch (error) {
        if (error instanceof Error) {
          console.error("削除に失敗しました:", error.message);
        }
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
};

/**
 * ユーザーを更新する。
 * @param user 更新するユーザー情報
 * @returns 成功か否か
 */
export const postEditUser = async (
  user: EditUserSchema,
): Promise<{
  success: boolean;
} | null> => {
  return authHandler(
    async () => {
      try {
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
      } catch (error) {
        if (error instanceof Error) {
          console.error("更新に失敗しました:", error.message);
        }
        return null;
      }
    },
    {
      // 管理者のみがこのアクションを実行できるようにする
      adminOnly: true,
    },
  );
};

export const getUsers = async (pagination: GetPaginationSchema) => {
  return authHandler(
    async () => {
      try {
        const data = getPaginationSchema.parse(pagination);
        return await getUsersPaginated(data.page, data.pageSize);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching users:", error.message);
        }
        throw new Error("ユーザー一覧の取得に失敗しました。");
      }
    },
    {
      adminOnly: true,
    },
  );
};
