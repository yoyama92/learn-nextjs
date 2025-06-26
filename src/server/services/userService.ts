import type { User } from "@/generated/prisma";
import { prisma } from "../db/client";

export const getUser = async (
  id: string,
): Promise<Pick<User, "name" | "email"> | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

export const updateUser = async (
  id: string,
  data: Partial<Pick<User, "name">>,
): Promise<Pick<User, "name" | "email">> => {
  const user = await prisma.user.update({
    where: {
      id: id,
      deletedAt: null,
    },
    data: {
      name: data.name,
    },
    select: {
      name: true,
      email: true,
      updatedAt: true,
    },
  });
  return user;
};
