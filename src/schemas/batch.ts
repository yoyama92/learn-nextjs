import { unixTimestampSchema, z } from "@/lib/zod";

/**
 * 現在のUNIXタイムスタンプを1時間単位に切り捨て
 * 例: 2023-10-01T12:34:56Z -> 2023-10-01T12:00:00Z
 */
const now = Math.floor(Date.now() / 1000 / 60 / 60) * 60 * 60;

export const exportUsersSchema = z.object({
  now: unixTimestampSchema.optional().default(now),
});

export type ExportUsersSchema = z.infer<typeof exportUsersSchema>;
