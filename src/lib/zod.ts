import * as z from "zod/v4";

z.config({
  customError: (iss) => {
    if (iss.code === "too_small") {
      if (iss.origin === "string" && iss.minimum === 1) {
        return "必須項目です。";
      }
    }
  },
});

export const signInSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(1).min(8).max(32),
});

export const signInSchemaKeys = signInSchema.keyof().enum;

export const userSchema = z.object({
  name: z.string().min(1),
});

export const userSchemaKeys = userSchema.keyof().enum;
