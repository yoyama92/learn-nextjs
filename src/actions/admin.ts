"use server";

import type * as z from "zod/v4";

import { authHandler } from "@/lib/auth";
import type { createUserSchema } from "@/lib/zod";
import { createUser } from "@/server/services/userService";

export const postNewUser = async (user: z.infer<typeof createUserSchema>) => {
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
      adminOnly: true,
    },
  );
};
