import { passwordSchema, z } from "@/lib/zod";

export const signInSchema = z.object({
  email: z.email().min(1),
  password: passwordSchema,
});

export const signInSchemaKeys = signInSchema.keyof().enum;

export type SignInSchema = z.infer<typeof signInSchema>;

export const resetPasswordSchema = z.object({
  email: z.email().min(1),
});

export const resetPasswordSchemaKeys = resetPasswordSchema.keyof().enum;

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
