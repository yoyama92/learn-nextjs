"use server";

import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { authHandler } from "../lib/session";
import type {
  CreateUserSchema,
  DeleteUserSchema,
  EditUserSchema,
} from "../schemas/admin";
import { createUser } from "../server/services/userService";

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
        return await createUser({
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
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
        const result = await auth.api.removeUser({
          body: {
            userId: user.id,
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
      await auth.api.adminUpdateUser({
        body: {
          userId: user.id,
          data: {
            name: user.name,
            email: user.email,
            role: user.isAdmin ? "admin" : "user",
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
};
