import { z } from "./zod";

/**
 * ランタイムが定義する環境変数
 */
const envSchemaBase = z.object({
  NEXT_RUNTIME: z.union([z.literal("nodejs"), z.literal("edge")]).optional(),
  NODE_ENV: z
    .union([z.literal("development"), z.literal("production")])
    .optional(),
});

/**
 * 環境変数定義
 */
const envSchema = envSchemaBase.extend({
  AWS_SES_ENDPOINT: z.url().optional().describe("SESの接続先"),
  AWS_S3_ENDPOINT: z.url().optional().describe("S3の接続先"),
  AWS_S3_FORCE_PATH_STYLE: z.coerce
    .boolean()
    .optional()
    .describe("MinioのS3互換APIを使用するためにフラグで制御"),
  AWS_S3_BUCKET: z.string().optional().describe("S3のバケット名"),
  AWS_REGION: z.string().optional().describe("AWSのリージョン名"),
  AWS_ACCESS_KEY_ID: z.string().optional().describe("AWSのアクセスキー"),
  AWS_SECRET_ACCESS_KEY: z
    .string()
    .optional()
    .describe("AWSのシークレットアクセスキー"),
  AWS_SES_FROM_EMAIL: z
    .email()
    .optional()
    .describe("SESで送信するメールに設定する送信元メールアドレス"),
  BATCH_API_TOKEN: z
    .string()
    .describe(
      "バッチ処理を外部から呼び出せないようにする簡易認証機能のためのトークン",
    ),
  BETTER_AUTH_URL: z.url().describe("Better AuthのベースURL"),
});

const publicEnvSchema = envSchema.pick({
  AWS_SES_FROM_EMAIL: true,
});

/**
 * 型安全に環境変数を取得するためのオブジェクト
 */
export const envStore = envSchema.parse(process.env);

export const publicEnvStore = publicEnvSchema.parse(process.env);

export type PublicEnvStore = z.infer<typeof publicEnvSchema>;
