import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export const sesClient = new SESv2Client({
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

export { SendEmailCommand };
