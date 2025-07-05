/**
 * パスワードをハッシュ化する関数。
 * Edge Runtimeではサポートされていないため、通常のNode.js環境でのみ使用する。
 * @param password　ハッシュ化するパスワード
 * @throws エッジランタイムではnode:cryptoがサポートされていないためエラーを投げる。
 * @returns
 */
export const saltAndHashPassword = (password?: unknown): string => {
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error("Password hashing is not supported in Edge Runtime");
  }

  // パスワードをハッシュ化する。
  if (typeof password !== "string") {
    throw new Error("Invalid password type");
  } else {
    const crypto = require("crypto");
    const hash = crypto.createHash("sha256").update(password).digest("hex");
    return hash;
  }
};

/**
 * ランダムなパスワードを生成する関数。
 * Edge Runtimeではサポートされていないため、通常のNode.js環境でのみ使用する。
 * @param length 生成するパスワードの長さ
 * @throws エッジランタイムではnode:cryptoがサポートされていないためエラーを投げる。
 * @returns
 */
export const generateRandomPassword = (length: number): string => {
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error("Password hashing is not supported in Edge Runtime");
  }
  const crypto = require("crypto");
  return crypto.randomBytes(length).toString("base64").slice(0, length);
};

/**
 * パスワードを検証する関数。
 * @param inputPassword 検証するパスワード
 * @param storedPassword 保存されているハッシュ化されたパスワード
 * @returns 入力されたパスワードが保存されているパスワードと一致するかどうか
 */
export const verifyPassword = (
  inputPassword: string,
  storedPassword: string,
): boolean => {
  const hashedInput = saltAndHashPassword(inputPassword);
  return hashedInput === storedPassword;
};
