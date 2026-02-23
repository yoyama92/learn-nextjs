import z from "zod";

import { notificationTypeSchema } from "./notification";

export const notificationAudienceEnum = Object.freeze({
  all: "all",
  allUsers: "ALL",
  selectedUsers: "SELECTED",
});

export const notificationArchiveFilterEnum = Object.freeze({
  active: "active",
  archived: "archived",
});

export const notificationAudienceSchema = z.union([
  z.literal(notificationAudienceEnum.allUsers),
  z.literal(notificationAudienceEnum.selectedUsers),
  z.literal(notificationAudienceEnum.all),
]);

export type NotificationAudience = z.infer<typeof notificationAudienceSchema>;

export type NotificationStatus = "published" | "scheduled" | "archived";
export type NotificationTargetUser = {
  id: string;
  name: string;
  email: string;
};

export const adminNotificationSearchParamSchema = z
  .object({
    q: z.string().optional(),
    type: notificationTypeSchema.optional(),
    audience: notificationAudienceSchema.optional(),
    archived: z
      .union([
        z.literal(notificationArchiveFilterEnum.active),
        z.literal(notificationArchiveFilterEnum.archived),
      ])
      .optional(),
    page: z.string().optional(),
  })
  .optional();

export const adminNotificationListQuerySchema = z.object({
  q: z.string().trim().default(""),
  type: notificationTypeSchema.default("all"),
  audience: notificationAudienceSchema.default(notificationAudienceEnum.all),
  archived: z
    .union([
      z.literal(notificationArchiveFilterEnum.active),
      z.literal(notificationArchiveFilterEnum.archived),
    ])
    .default(notificationArchiveFilterEnum.active),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
});

export type AdminNotificationListQuery = z.infer<
  typeof adminNotificationListQuerySchema
>;
export type AdminNotificationSearchParams = Omit<
  AdminNotificationListQuery,
  "pageSize"
>;

export const deleteNotificationSchema = z.object({
  id: z.uuidv4(),
});

export const deleteNotificationResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
    z.object({
      success: z.literal(true),
    }),
  ],
);

const adminNotificationTypeSchema = z.union([
  z.literal("info"),
  z.literal("warn"),
  z.literal("security"),
]);

const adminNotificationAudienceSchema = z.union([
  z.literal(notificationAudienceEnum.selectedUsers),
  z.literal(notificationAudienceEnum.allUsers),
]);

export type AdminNotificationType = z.infer<typeof adminNotificationTypeSchema>;
export type AdminNotificationTargetAudience = z.infer<
  typeof adminNotificationAudienceSchema
>;
export type AdminNotificationRow = {
  id: string;
  title: string;
  body: string;
  type: AdminNotificationType;
  audience: AdminNotificationTargetAudience;
  publishedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  status: NotificationStatus;
};
export type AdminNotificationRecipient = {
  userId: string;
  name: string;
  email: string;
  readAt: Date | null;
};
export type AdminNotificationDetail = AdminNotificationRow & {
  updatedAt: Date;
  recipients: AdminNotificationRecipient[];
};

const dateTimeLocalSchema = z.iso
  .datetime({ local: true, precision: -1 })
  .refine((value) => !value.endsWith("Z"), {
    message: "ローカル日時を入力してください。",
  });

const nullableDateTimeLocalSchema = z.union([
  dateTimeLocalSchema,
  z.literal(""),
]);

const ianaTimeZoneSchema = z
  .string()
  .trim()
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("ja-JP", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "有効なタイムゾーンを指定してください。");

const validateSelectedAudienceRecipients = (
  value: {
    audience: "ALL" | "SELECTED";
    recipientUserIds: string[];
  },
  ctx: z.core.$RefinementCtx,
) => {
  if (
    value.audience === notificationAudienceEnum.selectedUsers &&
    value.recipientUserIds.length === 0
  ) {
    ctx.addIssue({
      code: "custom",
      message: "対象ユーザーを1名以上選択してください。",
      path: ["recipientUserIds"],
    });
  }
};

export const notificationSchema = z
  .object({
    id: z.uuidv4(),
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    type: adminNotificationTypeSchema,
    audience: adminNotificationAudienceSchema,
    recipientUserIds: z.preprocess((value) => value ?? [], z.array(z.string())),
    publishedAt: nullableDateTimeLocalSchema,
    archivedAt: nullableDateTimeLocalSchema,
    clientTimeZone: ianaTimeZoneSchema,
  })
  .superRefine(validateSelectedAudienceRecipients);

export type NotificationSchema = z.infer<typeof notificationSchema>;

export const notificationFormSchema = notificationSchema
  .omit({
    id: true,
  })
  .superRefine(validateSelectedAudienceRecipients);

export const editNotificationResponseSchema = z.object({
  success: z.literal(true),
});

export const createNotificationResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
  }),
});

export type NotificationFormInputSchema = z.input<
  typeof notificationFormSchema
>;
export type NotificationFormSchema = z.infer<typeof notificationFormSchema>;
