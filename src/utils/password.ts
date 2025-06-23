/**
 * パスワードをハッシュ化する関数。
 * Edge Runtimeではサポートされていないため、通常のNode.js環境でのみ使用する。
 * @param password　ハッシュ化するパスワード
 * @throws エッジランタイムではnode:cryptoがサポートされていないためエラーを投げる。
 * @returns
 */
export const saltAndHashPassword = (
  password?: unknown,
): string => {
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error("Password hashing is not supported in Edge Runtime");
  }

  // パスワードをハッシュ化する。
  if (typeof password !== "string") {
    throw new Error("Invalid password type");
  } else {
    const crypto = require("crypto");
    const hash = crypto.createHash("sha256")
      .update(password)
      .digest("hex");
    return hash;
  }
};
