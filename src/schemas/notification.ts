import z from "zod";

export const idSchema = z.uuidv4();

export const idsSchema = z.array(idSchema);

export const notificationTypeEnum = Object.freeze({
  info: "info",
  warn: "warn",
  security: "security",
  all: "all",
});

export const notificationTypeSchema = z.union([
  z.literal(notificationTypeEnum.info),
  z.literal(notificationTypeEnum.warn),
  z.literal(notificationTypeEnum.security),
  z.literal(notificationTypeEnum.all),
]);

const tabSchema = z.union([z.literal("unread"), z.literal("all")]);

export type Tab = z.infer<typeof tabSchema>;

export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const searchParamSchema = z
  .object({
    tab: tabSchema.optional(),
    q: z.string().optional(),
    type: notificationTypeSchema.optional(),
    page: z.string().optional(),
  })
  .optional();

export const listQuerySchema = z.object({
  tab: tabSchema.default("unread"),
  q: z.string().trim().default(""),
  type: notificationTypeSchema.default("all"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
