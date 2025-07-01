import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import type { User } from "@/generated/prisma";
import { generateRandomPassword, saltAndHashPassword } from "@/utils/password";
import { prisma } from "../db/client";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_SES_ENDPOINT,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export const authorizeUser = async (
  email: string,
  password: string,
): Promise<User | null> => {
  const pwHash = saltAndHashPassword(password);
  const user = await prisma.user.findUnique({
    where: {
      email: email,
      password: pwHash,
    },
  });
  return user;
};

/**
 * パスワードリマインダーを送信する
 * @param email ユーザーのメールアドレス
 * @returns 送信の成功/失敗を示すオブジェクト
 */
export const passwordReminder = async (
  email: string,
): Promise<{ success: boolean }> => {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!user) {
    return { success: false };
  }

  // 12〜15文字のランダムなパスワードを生成
  const newPassword = generateRandomPassword(
    12 + Math.floor(Math.random() * 4),
  );
  const pwHash = saltAndHashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: pwHash },
  });

  const emailParams = {
    Destination: {
      ToAddresses: [email],
    },
    Content: {
      Simple: {
        Subject: {
          Data: "Password Reset",
        },
        Body: {
          Text: {
            Data: `Your new password is: ${newPassword}`,
          },
        },
      },
    },
    FromEmailAddress: process.env.AWS_SES_FROM_EMAIL || "",
  };
  await sesClient.send(new SendEmailCommand(emailParams));
  return { success: true };
};
