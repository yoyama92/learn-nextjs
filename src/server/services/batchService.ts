import { envStore } from "@/lib/env";
import type { ExportUsersRequestSchema } from "@/schemas/batch";
import { buildExportUserFile, buildFindExportUsersArgs } from "../domains/batch";
import { prisma } from "../infrastructures/db";
import {
  PutObjectCommand,
  type PutObjectCommandInput,
  s3Client,
} from "../infrastructures/s3";
import { buildCSVContent } from "@/utils/csv";

export const exportUsers = async (
  args: ExportUsersRequestSchema,
): Promise<void> => {
  const users = await prisma.user.findMany(buildFindExportUsersArgs(args.now));
  const { fileName, headers, fileContent } = buildExportUserFile(
    users,
    args.now,
  );

  const params: PutObjectCommandInput = {
    Bucket: envStore.AWS_S3_BUCKET,
    Key: fileName,
    Body: buildCSVContent(headers, fileContent),
    ContentType: "application/json",
  };
  try {
    await s3Client.send(new PutObjectCommand(params));
    console.log(
      `Users exported successfully to ${envStore.AWS_S3_BUCKET}/${fileName}`,
    );
  } catch (error) {
    console.error("Error exporting users:", error);
    throw error; // エラーを再スローして呼び出し元に通知
  }
};
