import { z } from "./zod";

const envSchemaBase = z.object({
  NEXT_RUNTIME: z.union([z.literal("nodejs"), z.literal("edge")]).optional(),
  NODE_ENV: z
    .union([z.literal("development"), z.literal("production")])
    .optional(),
});

const envSchema = envSchemaBase.extend({
  AWS_SES_ENDPOINT: z.url().optional(),
  AWS_S3_ENDPOINT: z.url().optional(),
  AWS_S3_FORCE_PATH_STYLE: z.coerce.boolean().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SES_FROM_EMAIL: z.email().optional(),
  BATCH_API_TOKEN: z.string(),
});

export const envStore = envSchema.parse(process.env);
