import { envStore } from "../../lib/env";
import { prisma } from "../infrastructures/db";
import { SendEmailCommand, sesClient } from "../infrastructures/ses";

/**
 * パスワードリマインダーを送信する
 * @param email ユーザーのメールアドレス
 * @returns 送信の成功/失敗を示すオブジェクト
 */
export const passwordReminder = async (
  email: string,
  token: string,
): Promise<{ success: boolean }> => {
  const url = new URL("/reset-password", envStore.BETTER_AUTH_URL);
  url.searchParams.append("token", token);
  try {
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
              Data: `Click the link to reset your password: ${url.toString()}`,
            },
          },
        },
      },
      FromEmailAddress: envStore.AWS_SES_FROM_EMAIL || "",
    };
    const result = await sesClient.send(new SendEmailCommand(emailParams));
    if (result.$metadata.httpStatusCode !== 200) {
      console.error("Failed to send email:", result);
      throw new Error("Failed to send email");
    }
    console.log("Email sent successfully:", result);
    return { success: true };
  } catch (error) {
    console.error("Error in password reminder:", error);
    return { success: false };
  }
};

/**
 * ユーザーの権限情報を取得する。
 * @param userId ユーザーID
 * @returns ユーザーの権限情報
 */
export const findUserRoles = async (
  userId: string,
): Promise<{
  isAdmin: boolean;
} | null> => {
  return await prisma.userRole.findUnique({
    where: { userId: userId },
    select: { isAdmin: true },
  });
};
