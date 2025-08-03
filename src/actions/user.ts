"use server";

import { authHandler } from "@/lib/auth";
import type { PasswordChangeSchema, UserSchema } from "@/schemas/user";
import { updateUser, updateUserPassword } from "@/server/services/userService";

export const postUser = async (user: UserSchema) => {
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

export const changePassword = async (input: PasswordChangeSchema) => {
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
