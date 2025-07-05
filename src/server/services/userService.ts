import type { User } from "@/generated/prisma";
import { hashPassword, verifyPassword } from "@/utils/password";
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
