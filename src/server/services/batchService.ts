import type { ExportUsersSchema } from "@/schemas/batch";
import { prisma } from "../infrastructures/db";

export const exportUsers = async (args: ExportUsersSchema): Promise<void> => {
  const from = new Date(args.now * 1000 - 24 * 60 * 60 * 1000); // 1日前からのデータを取得
  // ユーザー情報を取得

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: from, // fromはUNIXタイムスタンプなのでミリ秒に変換
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      role: {
        select: {
          isAdmin: true,
        },
      },
    },
  });

  // ここでユーザー情報をCSVやJSONなどの形式でエクスポートする処理を実装
  // 例えば、CSVファイルを生成してS3にアップロードするなど
  console.log("Exporting users:", JSON.stringify(users));
  // 実際のエクスポート処理は省略
  // 例: await exportToCSV(users);
  // または、ファイルシステムに保存するなど
  // ここではコンソールに出力するだけにしています
  console.log("Users exported successfully");
  // エクスポート処理が成功した場合は何も返さない
  // エラーが発生した場合は例外を投げる
  // 例: throw new Error("Export failed");
};
