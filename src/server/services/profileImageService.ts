import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { envStore } from "../../lib/env";
import { ForbiddenError, NotFoundError } from "../../utils/error";
import {
  buildProfileImageProxyUrl,
  createProfileImageObjectKey,
  extractProfileImageKey,
} from "../domains/profile";
import {
  GetObjectCommand,
  PutObjectCommand,
  s3Client,
} from "../infrastructures/s3";

const profileImageUploadTokenTtlSeconds = 5 * 60;

export const createProfileImagePresignedUploadUrl = async (payload: {
  userId: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
}) => {
  const key = createProfileImageObjectKey(payload.userId, payload.contentType);
  const bucket = envStore.AWS_S3_BUCKET;

  const uploadUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: payload.contentType,
    }),
    { expiresIn: profileImageUploadTokenTtlSeconds },
  );
  return {
    uploadUrl,
    imageUrl: buildProfileImageProxyUrl(key),
    profileImageUploadTokenTtlSeconds,
  };
};

/**
 * プロフィール画像を取得する
 * @param key S3オブジェクトキー
 * @param user 画像をリクエストしたユーザーの情報
 * @returns 画像データとコンテンツタイプ
 * @throws NotFoundError 画像が存在しない場合
 * @throws ForbiddenError 画像へのアクセス権がない場合
 */
export const getProfileImage = async (
  key: string,
  user: {
    image?: string | null;
  },
) => {
  if (!user.image) {
    throw new NotFoundError();
  }
  const ownKey = extractProfileImageKey(user.image);
  if (!ownKey || ownKey !== key) {
    throw new ForbiddenError();
  }

  const bucket = envStore.AWS_S3_BUCKET;

  const object = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!object.Body) {
    throw new NotFoundError();
  }

  return {
    data: Buffer.from(await object.Body.transformToByteArray()),
    contentType: object.ContentType,
  };
};
