import type { Prisma } from "../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { envStore } from "../../lib/env";
import { getLogger } from "../../lib/request-context";
import type { NotificationTargetUser } from "../../schemas/admin-notification";
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

const EXPORT_USERS_CSV_HEADERS = [
  "id",
  "name",
  "email",
  "createdAt",
  "updatedAt",
  "isAdmin",
];

const EXPORT_USERS_CHUNK_SIZE = envStore.EXPORT_USERS_CHUNK_SIZE;
export const toExportUsersCsv = async (
  controller: {
    enqueue: (chunk: Uint8Array) => void;
    close: () => void;
    error: (error: unknown) => void;
  },
  encoder: TextEncoder,
) => {
  try {
    controller.enqueue(encoder.encode(toCsvLine(EXPORT_USERS_CSV_HEADERS)));

    let cursor: string | undefined;
    while (true) {
      const users = await getUsersForExportChunk({
        cursor,
        take: EXPORT_USERS_CHUNK_SIZE,
      });

      if (users.length === 0) {
        break;
      }

      for (const user of users) {
        controller.enqueue(encoder.encode(toExportUsersCsvLine(user)));
      }

      const lastUser = users.at(-1);
      if (!lastUser) {
        break;
      }

      cursor = lastUser.id;
    }
  } catch (error) {
    const logger = getLogger();
    logger.error({ error }, "Error exporting users to CSV");
    throw error;
  } finally {
    controller.close();
  }
};

const getUsersForExportChunk = async (params: {
  cursor?: string;
  take: number;
}): Promise<UserGetResult[]> => {
  const { cursor, take } = params;

  return await prisma.user.findMany({
    select: userSelectArg,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    orderBy: {
      id: "asc",
    },
    take,
  });
};

const toExportUsersCsvLine = (user: UserGetResult): string => {
  return toCsvLine([
    user.id,
    user.name,
    user.email,
    user.createdAt.toISOString(),
    user.updatedAt.toISOString(),
    (user.role === "admin").toString(),
  ]);
};

const toCsvLine = (cells: string[]): string => {
  return `${cells
    .map((cell) => `"${cell.replaceAll('"', '""')}"`)
    .join(",")}\n`;
};

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
    select: typeof userSelectArg;
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
    select: userSelectArg,
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
  NotificationTargetUser[]
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
