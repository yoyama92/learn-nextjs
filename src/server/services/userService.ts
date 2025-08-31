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
    select: usersSelectArg,
    orderBy: {
      createdAt: "asc",
    },
  });
  return users;
};

export const updateUser = async (
  id: string,
  data: Omit<Prisma.UserUpdateInput, "role"> & {
    role?: Partial<Prisma.UserRoleCreateInput>;
  },
): Promise<Pick<User, "name" | "email">> => {
  // 安全のために更新する値はカラムごとに指定する。
  const user = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      email: data.email,
      name: data.name,
      role: {
        delete: {},
        create: data.role
          ? {
              isAdmin: data.role?.isAdmin,
            }
          : undefined,
      },
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
    where: { id: id },
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

/**
 * ユーザーを削除する。
 * @param id 削除するユーザーのID
 * @returns 削除したユーザーのID
 */
export const deleteUser = async (
  id: string,
): Promise<Promise<Pick<User, "id">>> => {
  return await prisma.user.delete({
    where: {
      id: id,
    },
    select: {
      id: true,
    },
  });
};

const activityHistorySelectArg =
  Prisma.validator<Prisma.ActivityHistorySelect>()({
    id: true,
    createdAt: true,
    loginHistory: {
      select: {
        asAdmin: true,
      },
    },
  });

const userWithActivitiesSelectArg = Prisma.validator<Prisma.UserSelect>()({
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
  activityHistories: {
    select: activityHistorySelectArg,
    orderBy: {
      createdAt: "desc",
    },
  },
});

export type UserWithActivitiesGetResult = Prisma.UserGetPayload<{
  select: typeof userWithActivitiesSelectArg;
}>;

type ActivityHistory = {
  id: string;
  createdAt: Date;
  activity: string;
};

export const getUserWithActivities = async (
  id: string,
): Promise<
  | (Omit<UserWithActivitiesGetResult, "activityHistories"> & {
      activityHistories: ActivityHistory[];
    })
  | null
> => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: userWithActivitiesSelectArg,
  });

  if (user) {
    const { activityHistories, ...otherProps } = user;
    return {
      ...otherProps,
      activityHistories: activityHistories
        .map((activityHistory) => {
          return formatActivity(activityHistory);
        })
        .filter((value) => value !== undefined),
    };
  }
  return user;
};

const formatActivity = (
  activityHistory: Prisma.ActivityHistoryGetPayload<{
    select: typeof activityHistorySelectArg;
  }>,
): ActivityHistory | undefined => {
  const activity = activityHistory.loginHistory
    ? `${activityHistory.loginHistory.asAdmin ? "管理者" : "一般ユーザー"}としてログイン`
    : "";
  if (activity) {
    return {
      id: activityHistory.id,
      createdAt: activityHistory.createdAt,
      activity: activity,
    };
  }
};
