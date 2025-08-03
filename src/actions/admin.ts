"use server";

import { authHandler } from "@/lib/auth";
import type { CreateUserSchema } from "@/schemas/admin";
import { createUser } from "@/server/services/userService";

export const postNewUser = async (user: CreateUserSchema) => {
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
