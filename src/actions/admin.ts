"use server";

import { authHandler } from "../lib/auth";
import type { CreateUserSchema } from "../schemas/admin";
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
