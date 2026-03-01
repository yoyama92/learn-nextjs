import { passwordSchema, z } from "../lib/zod";

export const userSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1).optional(),
});

export const userSchemaKeys = userSchema.keyof().enum;

export type UserSchema = z.infer<typeof userSchema>;

export const postUserResponseSchema = z.object({
  status: z.boolean(),
});

export const profileImageAllowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const profileImageMaxSizeBytes = 5 * 1024 * 1024;

export const profileImageUploadRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(profileImageAllowedContentTypes),
  size: z.number().int().positive().max(profileImageMaxSizeBytes),
});

export type ProfileImageUploadRequestSchema = z.infer<
  typeof profileImageUploadRequestSchema
>;

export const profileImageUploadResponseSchema = z.object({
  uploadUrl: z.string().min(1),
  imageUrl: z.string().min(1),
  expiresInSeconds: z.number().int().positive(),
});

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

export const passwordChangeResponseSchema = z.object({
  success: z.literal(true),
});
