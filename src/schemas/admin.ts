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
