import type { Prisma } from "../../generated/prisma/client";

const exportUserSelectArg = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: true,
} satisfies Prisma.UserSelect;

/**
 * ユーザー出力のためのPrismaのクエリを構築する。
 * @param now 現在時刻
 * @returns findManyの引数
 */
export const buildFindExportUsersArgs = (now: number) => {
  // 1日前からのデータを取得
  const from = new Date(now * 1000 - 24 * 60 * 60 * 1000);
  return {
    where: {
      createdAt: {
        gte: from,
      },
    },
    select: exportUserSelectArg,
  } satisfies Prisma.UserFindManyArgs;
};

/**
 * CSVファイルに出力する情報を返す。
 * @param users DBから取得したユーザー情報
 * @param now 現在時刻
 * @returns CSVファイルに出力する情報
 */
export const buildExportUserFile = (
  users: Prisma.UserGetPayload<{
    select: typeof exportUserSelectArg;
  }>[],
  now: number,
): {
  fileName: string;
  headers: string[];
  fileContent: string[][];
} => {
  // ユーザー情報をS3にエクスポート
  const fileName = `users-${now}.csv`;
  const headers = ["id", "name", "email", "createdAt", "updatedAt", "isAdmin"];
  const fileContent = users.map((user) => {
    return [
      user.id,
      user.name,
      user.email,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString(),
      (user.role === "admin").toString(),
    ];
  });
  return { fileName, headers, fileContent };
};
