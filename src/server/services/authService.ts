import { envStore } from "../../lib/env";
import { getLogger } from "../../lib/request-context";
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
  const logger = getLogger();
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
      logger.error({ result: result }, "Failed to send email");
      throw new Error("Failed to send email");
    }
    logger.info({ result }, "Email sent successfully");
    return { success: true };
  } catch (error) {
    logger.error({ error }, "Error in password reminder");
    return { success: false };
  }
};
