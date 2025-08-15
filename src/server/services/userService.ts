import { Prisma, type User } from "../../generated/prisma";
import { envStore } from "../../lib/env";
import {
  generateRandomPassword,
  hashPassword,
  verifyPassword,
} from "../../utils/password";
import { prisma } from "../infrastructures/db";
import { SendEmailCommand, sesClient } from "../infrastructures/ses";

const userSelectArg = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      isAdmin: true,
    },
  },
});

export type UserGetResult = Prisma.UserGetPayload<{
  select: typeof userSelectArg;
}>;

export const getUser = async (id: string): Promise<UserGetResult | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
      deletedAt: null,
    },
    select: userSelectArg,
  });
  return user;
};

const usersSelectArg = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      isAdmin: true,
    },
  },
});

export const getUsers = async (): Promise<
  Prisma.UserGetPayload<{
    select: typeof usersSelectArg;
  }>[]
> => {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    select: usersSelectArg,
  });
  return users;
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

/**
 * ユーザーのパスワードを更新する
 * @param id ユーザーID
 * @param data パスワード変更に必要なデータ
 * @param data.currentPassword 現在のパスワード
 * @param data.newPassword 新しいパスワード
 * @param data.confirmNewPassword 新しいパスワードの確認用
 * @returns 成功/失敗を示すオブジェクト
 */
export const updateUserPassword = async (
  id: string,
  data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  },
): Promise<{
  success: boolean;
}> => {
  if (data.newPassword !== data.confirmNewPassword) {
    return { success: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: id, deletedAt: null },
    select: {
      id: true,
      password: true,
    },
  });

  // パスワードが一致しない場合は失敗
  if (!user || !user.password) {
    return { success: false };
  }

  // パスワード検証関数を使って比較
  const isPasswordValid = verifyPassword(data.currentPassword, user.password);
  if (!isPasswordValid) {
    return { success: false };
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashPassword(data.newPassword),
    },
    select: {
      id: true,
    },
  });
  return { success: true };
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

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashPassword(newPassword),
      role: {
        create: {
          isAdmin: data.isAdmin ?? false, // デフォルトは非管理者
        },
      },
    },
    select: {
      email: true,
    },
  });

  try {
    const emailParams = {
      Destination: {
        ToAddresses: [user.email],
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
    console.error("Error sending email:", error);
    return {
      mailSent: false,
    };
  }
};
