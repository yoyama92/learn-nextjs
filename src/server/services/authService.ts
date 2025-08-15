import type { User } from "@/generated/prisma";
import { envStore } from "@/lib/env";
import {
  generateRandomPassword,
  hashPassword,
  verifyPassword,
} from "@/utils/password";
import { prisma } from "../infrastructures/db";
import { SendEmailCommand, sesClient } from "../infrastructures/ses";

export const authorizeUser = async (
  email: string,
  password: string,
  isAdmin: boolean = false,
): Promise<Pick<User, "id"> | null> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
      role: isAdmin
        ? {
            isAdmin: isAdmin,
          }
        : undefined,
      // password: pwHash,
    },
    select: {
      id: true,
      password: true,
    },
  });
  if (!user || !user.password) {
    return null;
  }
  // パスワードの検証
  const isPasswordValid = verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  // 漏洩防止のためにパスワードを返さない
  return {
    id: user.id,
  };
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
    select: {
      id: true,
    },
  });
  if (!user) {
    return { success: false };
  }

  // 12〜15文字のランダムなパスワードを生成
  const newPassword = generateRandomPassword(
    12 + Math.floor(Math.random() * 4),
  );
  const pwHash = hashPassword(newPassword);
  try {
    return await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { password: pwHash },
      });
      if (!updatedUser) {
        return { success: false };
      }
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
        FromEmailAddress: envStore.AWS_SES_FROM_EMAIL || "",
      };
      const result = await sesClient.send(new SendEmailCommand(emailParams));

      // メールの送信に失敗した場合は、パスワード更新をロールバックする。
      if (result.$metadata.httpStatusCode !== 200) {
        console.error("Failed to send email:", result);
        throw new Error("Failed to send email");
      }
      console.log("Email sent successfully:", result);
      return { success: true };
    });
  } catch (error) {
    console.error("Error in password reminder:", error);
    return { success: false };
  }
};
