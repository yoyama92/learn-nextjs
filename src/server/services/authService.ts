import type { User } from "@/generated/prisma";
import { saltAndHashPassword } from "@/utils/password";
import { prisma } from "../db/client";

export const authorizeUser = async (
  email: string,
  password: string,
): Promise<User | null> => {
  const pwHash = saltAndHashPassword(password);
  const user = await prisma.user.findUnique({
    where: {
      email: email,
      password: pwHash,
    },
  });
  return user;
};
