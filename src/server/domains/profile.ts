/**
 * プロファイル画像のオブジェクトキーを生成する
 * @param userId ユーザーID
 * @param contentType コンテンツタイプ
 * @returns  生成されたオブジェクトキー
 */
export const createProfileImageObjectKey = (
  userId: string,
  contentType: "image/jpeg" | "image/png" | "image/webp",
) => {
  const extension = (() => {
    switch (contentType) {
      case "image/jpeg":
        return "jpg";
      case "image/png":
        return "png";
      case "image/webp":
        return "webp";
    }
  })();

  return `profile-images/${userId}/${crypto.randomUUID()}.${extension}`;
};

const profileImageKey = "key";

/**
 * プロフィール画像のアプリ内配信URLを生成する
 * @param key S3オブジェクトキー
 * @returns アプリ経由の画像URL
 */
export const buildProfileImageProxyUrl = (key: string) => {
  const params = new URLSearchParams({
    [profileImageKey]: key,
  });
  return `/api/images/profile-image?${params.toString()}`;
};

/**
 * 保存済み画像URLからS3キーを復元する
 * @param imageValue DBに保存されているimageフィールド値
 * @returns S3オブジェクトキー
 */
export const extractProfileImageKey = (imageValue: string) => {
  let url: URL;
  try {
    url = new URL(imageValue, "http://localhost");
  } catch {
    return null;
  }

  return url.searchParams.get(profileImageKey);
};
