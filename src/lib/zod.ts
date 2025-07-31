import * as z from "zod";

const passwordSchema = z.string().min(8).max(32);

z.config({
  customError: (iss) => {
    if (iss.code === "too_small") {
      if (iss.origin === "string" && iss.minimum === 1) {
        return "必須項目です。";
      }
    }

    if (iss.code === "invalid_format") {
      if (iss.format === "email") {
        return "メールアドレスの形式が正しくありません。";
      }
    }
  },
});

export const signInSchema = z.object({
  email: z.email().min(1),
  password: passwordSchema,
});

export const signInSchemaKeys = signInSchema.keyof().enum;

export const userSchema = z.object({
  name: z.string().min(1),
});

export const userSchemaKeys = userSchema.keyof().enum;

export const passwordChangeSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema,
  })
  .refine(
    (data) => {
      return data.newPassword === data.confirmNewPassword;
    },
    {
      message: "新しいパスワードと確認用パスワードが一致しません。",
      path: ["confirmNewPassword"],
    },
  );

export const passwordChangeSchemaKeys = passwordChangeSchema.keyof().enum;

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
  isAdmin: z.boolean().optional(),
});

export const createUserSchemaKeys = createUserSchema.keyof().enum;
