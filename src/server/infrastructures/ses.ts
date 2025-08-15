import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { envStore } from "../../lib/env";

export const sesClient = new SESv2Client({
  region: envStore.AWS_REGION,
  endpoint: envStore.AWS_SES_ENDPOINT,
  credentials:
    envStore.AWS_ACCESS_KEY_ID && envStore.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: envStore.AWS_ACCESS_KEY_ID,
          secretAccessKey: envStore.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export { SendEmailCommand };
