import type { Prisma } from "../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { envStore } from "../../lib/env";
import { getLogger } from "../../lib/request-context";
import { generateRandomPassword } from "../../utils/password";
import { prisma } from "../infrastructures/db";
import { SendEmailCommand, sesClient } from "../infrastructures/ses";

const userSelectArg = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: true,
} satisfies Prisma.UserSelect;

type UserGetResult = Prisma.UserGetPayload<{
  select: typeof userSelectArg;
}>;

/**
 * ページ指定でユーザー情報を取得する。
 * @param page 取得ページ
 * @param pageSize 取得するユーザー情報の上限数。
 * @returns ユーザー情報一覧
 */
export const getUsersPaginated = async (
  page: number,
  pageSize: number = 10,
): Promise<{
  users: Prisma.UserGetPayload<{
    select: typeof usersSelectArg;
  }>[];
  total: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
}> => {
  const skip = (page - 1) * pageSize;

  // 総件数を取得
  const total = await prisma.user.count();

  // ページ分のデータを取得
  const users = await prisma.user.findMany({
    select: usersSelectArg,
    orderBy: {
      createdAt: "asc",
    },
    skip: skip,
    take: pageSize,
  });

  return {
    users,
    total,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
};

export const getUser = async (id: string): Promise<UserGetResult | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: userSelectArg,
  });
  return user;
};

export const getUsersForNotificationTarget = async (): Promise<
  {
    id: string;
    name: string;
    email: string;
  }[]
> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return users;
};

const usersSelectArg = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: true,
} satisfies Prisma.UserSelect;

export const createUser = async (data: {
  name: string;
  email: string;
  isAdmin?: boolean;
}): Promise<{
  mailSent: boolean;
}> => {
  const newPassword = generateRandomPassword(
    12 + Math.floor(Math.random() * 4),
  );
  const createdUser = await auth.api.createUser({
    body: {
      name: data.name,
      email: data.email,
      password: newPassword,
      role: data.isAdmin ? "admin" : "user",
    },
  });

  try {
    const emailParams = {
      Destination: {
        ToAddresses: [createdUser.user.email],
      },
      Content: {
        Simple: {
          Subject: {
            Data: "Invitation to Join",
          },
          Body: {
            Text: {
              Data: `Your password is: ${newPassword}`,
            },
          },
        },
      },
      FromEmailAddress: envStore.AWS_SES_FROM_EMAIL || "",
    };
    const result = await sesClient.send(new SendEmailCommand(emailParams));
    return {
      mailSent: result.$metadata.httpStatusCode === 200,
    };
  } catch (error) {
    const logger = getLogger();
    logger.error({ error: error }, "Error sending email");
    return {
      mailSent: false,
    };
  }
};
