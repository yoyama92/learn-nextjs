"use server";

import type * as z from "zod/v4";

import { authHandler } from "@/lib/auth";
import type { userSchema } from "@/lib/zod";
import { updateUser } from "@/server/services/userService";

export const postUser = async (user: z.infer<typeof userSchema>) => {
  return authHandler(async (id) => {
    try {
      return await updateUser(id, {
        name: user.name,
      });
    } catch (error) {
      // TODO: handle error
      if (error instanceof Error) {
        console.error("Error updating user:", error.message);
      }
      return null;
    }
  });
};
