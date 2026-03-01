import { S3Client } from "@aws-sdk/client-s3";

import { envStore } from "../../lib/env";

export const s3Client = new S3Client({
  region: envStore.AWS_REGION,
  endpoint: envStore.AWS_S3_ENDPOINT,
  forcePathStyle: true,
  credentials:
    envStore.AWS_ACCESS_KEY_ID && envStore.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: envStore.AWS_ACCESS_KEY_ID,
          secretAccessKey: envStore.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export {
  GetObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
