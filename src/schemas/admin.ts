import { z } from "../lib/zod";

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
  isAdmin: z.boolean().optional(),
});

export const userSchemaKeys = userSchema.keyof().enum;

export type UserSchema = z.infer<typeof userSchema>;

export const createUserSchema = userSchema.extend({
  // userSchemaと同一と見なされないようにするために空のextendを設定
});

export const createUserResponseSchema = z.object({
  mailSent: z.boolean(),
});

export const createUserSchemaKeys = createUserSchema.keyof().enum;

export type CreateUserSchema = z.infer<typeof createUserSchema>;

const bulkCreateUserSchema = z.object({
  rowNumber: z.number().int().min(1),
  name: z.string().trim().min(1),
  email: z.email().trim().toLowerCase(),
});

const deprecatedEmailCheck = (
  users: z.infer<typeof bulkCreateUserSchema>[],
  ctx: z.RefinementCtx,
) => {
  const duplicatedEmailIndexes = new Map<string, number[]>();

  users.forEach((user, index) => {
    const normalizedEmail = user.email.trim().toLowerCase();
    const indexes = duplicatedEmailIndexes.get(normalizedEmail);
    if (indexes) {
      indexes.push(index);
    } else {
      duplicatedEmailIndexes.set(normalizedEmail, [index]);
    }
  });

  for (const indexes of duplicatedEmailIndexes.values()) {
    if (indexes.length < 2) {
      continue;
    }
    indexes.forEach((index) => {
      ctx.addIssue({
        code: "custom",
        path: ["users", index, "email"],
        message: "メールアドレスがCSV内で重複しています。",
      });
    });
  }
};

export const bulkCreateUsersSchema = z
  .object({
    users: z
      .array(bulkCreateUserSchema)
      .min(1, "CSVにユーザー行がありません。")
      .max(100, "1回の取り込み上限は100名です。"),
  })
  .superRefine(({ users }, ctx) => {
    deprecatedEmailCheck(users, ctx);
  });

export const bulkCreateUsersResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  failures: z.array(
    z.object({
      rowNumber: z.number().int().min(1),
      email: z.string(),
      reason: z.string(),
    }),
  ),
});

export type BulkCreateUsersResponseSchema = z.infer<
  typeof bulkCreateUsersResponseSchema
>;

export const deleteUserSchema = z.object({
  id: z.string(),
});

export const deleteUserResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
  z.object({
    success: z.literal(true),
  }),
]);

export const editUserSchema = userSchema.extend({
  id: z.string(),
});

export const editUserResponseSchema = z.object({
  success: z.literal(true),
});

export type EditUserSchema = z.infer<typeof editUserSchema>;

export const getPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100),
});

export const getPaginationResponseSchema = z.object({
  users: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      role: z.string().nullable(),
    }),
  ),
  total: z.number().positive(),
  pageSize: z.number().positive(),
  totalPages: z.number().positive(),
  currentPage: z.number().positive(),
});

export type GetPaginationResponseSchema = z.infer<
  typeof getPaginationResponseSchema
>;
