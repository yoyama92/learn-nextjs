import bcrypt from "bcryptjs";

import { generate } from "generate-password";

/**
 * パスワードをハッシュ化する関数。
 * @param password ハッシュ化するパスワード
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
 * @param length 生成するパスワードの長さ
 * @returns
 */
export const generateRandomPassword = (length: number): string => {
  const randomPassword = generate({
    length: length,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    strict: true,
  });
  return randomPassword;
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
  const hashedInput = hashPassword(inputPassword);

  // Convert both hashes to Buffers for timingSafeEqual
  const hashedInputBuffer = Buffer.from(hashedInput, "hex");
  const storedPasswordBuffer = Buffer.from(storedPassword, "hex");

  // If lengths differ, immediately return false to avoid errors
  if (hashedInputBuffer.length !== storedPasswordBuffer.length) {
    return false;
  }

  return bcrypt.compareSync(inputPassword, storedPassword);
};
