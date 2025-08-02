import { describe, expect, test } from "vitest";
import {
  generateRandomPassword,
  hashPassword,
  verifyPassword,
} from "../password";

describe("hashPassword", () => {
  test("文字列以外を渡すと例外を投げる", () => {
    // undefined, number, object などを渡した場合
    expect(() => hashPassword(undefined)).toThrow("Invalid password type");
  });
});

describe("generateRandomPassword", () => {
  test("指定した長さの文字列を返す", () => {
    const len = 16;
    const pwd = generateRandomPassword(len);
    expect(typeof pwd).toBe("string");
    expect(pwd.length).toBe(len);
  });

  test("数字・記号・大文字・小文字がそれぞれ少なくとも1文字含まれる (strict オプション動作確認)", () => {
    const pwd = generateRandomPassword(20);
    expect(/[0-9]/.test(pwd)).toBe(true);
    expect(/[A-Z]/.test(pwd)).toBe(true);
    expect(/[a-z]/.test(pwd)).toBe(true);
    expect(/[^A-Za-z0-9]/.test(pwd)).toBe(true); // 記号
  });
});

describe("verifyPassword", () => {
  const correct = "CorrectHorseBatteryStaple!";
  const wrong = "Tr0ub4dor&3";

  test("正しいパスワードとハッシュなら true を返す", () => {
    const stored = hashPassword(correct);
    expect(verifyPassword(correct, stored)).toBe(true);
  });

  test("間違ったパスワードなら false を返す", () => {
    const stored = hashPassword(correct);
    expect(verifyPassword(wrong, stored)).toBe(false);
  });

  test("ハッシュ文字列の長さが異なれば false を返す", () => {
    // 意図的に長さの違う文字列を渡す
    expect(verifyPassword(correct, "abcd1234")).toBe(false);
  });
});
