import bcrypt from "bcryptjs";

/**
 * パスワードをハッシュ化する関数。
 * @param password　ハッシュ化するパスワード
 */
export const hashPassword = (password?: unknown): string => {
  if (typeof password !== "string") {
    throw new Error("Invalid password type");
  } else {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
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
  const crypto = require("node:crypto");
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
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error("Password hashing is not supported in Edge Runtime");
  }
  const hashedInput = hashPassword(inputPassword);

  // Convert both hashes to Buffers for timingSafeEqual
  const hashedInputBuffer = Buffer.from(hashedInput, "hex");
  const storedPasswordBuffer = Buffer.from(storedPassword, "hex");

  // If lengths differ, immediately return false to avoid errors
  if (hashedInputBuffer.length !== storedPasswordBuffer.length) {
    return false;
  }

  const crypto = require("node:crypto");
  return crypto.timingSafeEqual(hashedInputBuffer, storedPasswordBuffer);
};
