import { passwordSchema, z } from "@/lib/zod";

export const userSchema = z.object({
  name: z.string().min(1),
});

export const userSchemaKeys = userSchema.keyof().enum;

export type UserSchema = z.infer<typeof userSchema>;

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

export type PasswordChangeSchema = z.infer<typeof passwordChangeSchema>;
