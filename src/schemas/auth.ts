import { passwordSchema, z } from "@/lib/zod";

export const signInSchema = z.object({
  email: z.email().min(1),
  password: passwordSchema,
});

export const signInSchemaKeys = signInSchema.keyof().enum;
