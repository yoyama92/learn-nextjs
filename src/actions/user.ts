"use server";

import { headers } from "next/headers";

import { auth } from "../lib/auth";
import { definePrivateAction } from "../lib/define-action";
import {
  passwordChangeResponseSchema,
  passwordChangeSchema,
  profileImageUploadRequestSchema,
  profileImageUploadResponseSchema,
  postUserResponseSchema,
  userSchema,
} from "../schemas/user";
import { createProfileImagePresignedUploadUrl } from "../server/services/profileImageService";

/**
 * ユーザー情報を更新する
 * @param user ユーザー情報
 * @returns 更新結果
 */
export const postUser = definePrivateAction({
  input: userSchema,
  output: postUserResponseSchema,
  name: "post_user",
}).handler(async ({ input }) => {
  return await auth.api.updateUser({
    body: input,
    headers: await headers(),
  });
});

/**
 * プロフィール画像アップロード用の署名付きURLを発行する
 */
export const createProfileImageUploadUrl = definePrivateAction({
  input: profileImageUploadRequestSchema,
  output: profileImageUploadResponseSchema,
  name: "create_profile_image_upload_url",
}).handler(async ({ input, ctx }) => {
  const { uploadUrl, imageUrl, profileImageUploadTokenTtlSeconds } =
    await createProfileImagePresignedUploadUrl({
      userId: ctx.session.user.id,
      contentType: input.contentType,
    });

  return {
    uploadUrl,
    imageUrl: imageUrl,
    expiresInSeconds: profileImageUploadTokenTtlSeconds,
  };
});

/**
 * パスワードを更新する。
 * @param input 更新内容
 * @returns 更新結果
 */
export const changePassword = definePrivateAction({
  input: passwordChangeSchema,
  output: passwordChangeResponseSchema,
  name: "change_password",
}).handler(async ({ input }) => {
  await auth.api.changePassword({
    body: {
      newPassword: input.newPassword,
      currentPassword: input.currentPassword,
      revokeOtherSessions: true,
    },
    headers: await headers(),
  });
  return {
    success: true,
  };
});
