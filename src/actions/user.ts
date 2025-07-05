"use server";

import type * as z from "zod/v4";

import { authHandler } from "@/lib/auth";
import type { passwordChangeSchema, userSchema } from "@/lib/zod";
import { updateUser, updateUserPassword } from "@/server/services/userService";

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

export const changePassword = async (
  input: z.infer<typeof passwordChangeSchema>,
) => {
  return authHandler(async (id) => {
    try {
      return await updateUserPassword(id, {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        confirmNewPassword: input.confirmNewPassword,
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
