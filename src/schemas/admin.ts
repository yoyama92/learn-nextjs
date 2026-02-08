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

export const createUserSchemaKeys = createUserSchema.keyof().enum;

export type CreateUserSchema = z.infer<typeof createUserSchema>;

export const deleteUserSchema = z.object({
  id: z.string(),
});

export type DeleteUserSchema = z.infer<typeof deleteUserSchema>;

export const editUserSchema = userSchema.extend({
  id: z.string(),
});

export type EditUserSchema = z.infer<typeof editUserSchema>;
