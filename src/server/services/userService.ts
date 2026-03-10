import { APIError } from "better-auth";
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

const DUPLICATE_EMAIL_ERROR_MESSAGE = "メールアドレスが重複しています。";
const CREATE_USER_ERROR_MESSAGE = "ユーザー作成に失敗しました。";

const userExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });
    return existingUser !== null;
  } catch (error) {
    const logger = getLogger();
    logger.error({ error }, "Error checking if user exists by email");
    return false;
  }
};

export const bulkCreateUsers = async (
  users: {
    rowNumber: number;
    name: string;
    email: string;
  }[],
): Promise<{
  total: number;
  successCount: number;
  failedCount: number;
  failures: {
    rowNumber: number;
    email: string;
    reason: string;
  }[];
}> => {
  const failures: {
    rowNumber: number;
    email: string;
    reason: string;
  }[] = [];

  let successCount = 0;
  for (const user of users) {
    try {
      await createUser({
        name: user.name,
        email: user.email,
      });
      successCount += 1;
    } catch (error) {
      const logger = getLogger();
      logger.error({ error }, "Error creating user in bulk operation");
      if (error instanceof APIError && error.status !== "BAD_REQUEST") {
        failures.push({
          rowNumber: user.rowNumber,
          email: user.email,
          reason: CREATE_USER_ERROR_MESSAGE,
        });
      } else {
        const isDuplicate = await userExistsByEmail(user.email);
        failures.push({
          rowNumber: user.rowNumber,
          email: user.email,
          reason: isDuplicate
            ? DUPLICATE_EMAIL_ERROR_MESSAGE
            : CREATE_USER_ERROR_MESSAGE,
        });
      }
    }
  }

  return {
    total: users.length,
    successCount,
    failedCount: failures.length,
    failures: failures.sort((a, b) => a.rowNumber - b.rowNumber),
  };
};
