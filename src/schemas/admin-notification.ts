import z from "zod";

import { notificationTypeSchema } from "./notification";

export const notificationAudienceEnum = Object.freeze({
  all: "all",
  allUsers: "ALL",
  selectedUsers: "SELECTED",
});

export const notificationAudienceSchema = z.union([
  z.literal(notificationAudienceEnum.allUsers),
  z.literal(notificationAudienceEnum.selectedUsers),
  z.literal(notificationAudienceEnum.all),
]);

export type NotificationAudience = z.infer<typeof notificationAudienceSchema>;

export const adminNotificationSearchParamSchema = z
  .object({
    q: z.string().optional(),
    type: notificationTypeSchema.optional(),
    audience: notificationAudienceSchema.optional(),
    page: z.string().optional(),
  })
  .optional();

export const adminNotificationListQuerySchema = z.object({
  q: z.string().trim().default(""),
  type: notificationTypeSchema.default("all"),
  audience: notificationAudienceSchema.default(notificationAudienceEnum.all),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
});

export type AdminNotificationListQuery = z.infer<
  typeof adminNotificationListQuerySchema
>;
