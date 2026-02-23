import { z } from "../lib/zod";

export const adminUserIdParamsSchema = z.object({
  id: z.string().describe("対象ユーザーID"),
});

export type AdminUserIdParams = z.infer<typeof adminUserIdParamsSchema>;

export const adminNotificationIdParamsSchema = z.object({
  id: z.uuidv4(),
});

export type AdminNotificationIdParams = z.infer<
  typeof adminNotificationIdParamsSchema
>;
