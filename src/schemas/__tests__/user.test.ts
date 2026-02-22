import { describe, expect, test } from "vitest";

import { passwordChangeSchema, userSchema } from "../user";

describe("userSchema", () => {
  test("有効な名前でバリデーション成功", () => {
    const input = {
      name: "John Doe",
    };
    const result = userSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  test("空の名前でバリデーション失敗", () => {
    const input = {
      name: "",
    };
    const result = userSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("passwordChangeSchema", () => {
  test("有効なパスワード組み合わせでバリデーション成功", () => {
    const input = {
      currentPassword: "CurrentPassword123!",
      newPassword: "NewPassword123!",
      confirmNewPassword: "NewPassword123!",
    };
    const result = passwordChangeSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentPassword).toBe(input.currentPassword);
      expect(result.data.newPassword).toBe(input.newPassword);
    }
  });

  test("現在のパスワードが短いとバリデーション失敗", () => {
    const input = {
      currentPassword: "short",
      newPassword: "NewPassword123!",
      confirmNewPassword: "NewPassword123!",
    };
    const result = passwordChangeSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("新しいパスワードが短いとバリデーション失敗", () => {
    const input = {
      currentPassword: "CurrentPassword123!",
      newPassword: "short",
      confirmNewPassword: "short",
    };
    const result = passwordChangeSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("パスワードが最大長を超えるとバリデーション失敗", () => {
    const longPassword = "a".repeat(33);
    const input = {
      currentPassword: longPassword,
      newPassword: longPassword,
      confirmNewPassword: longPassword,
    };
    const result = passwordChangeSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("必須フィールドが欠けるとバリデーション失敗", () => {
    const input = {
      currentPassword: "CurrentPassword123!",
      newPassword: "NewPassword123!",
      // confirmNewPasswordが欠けている
    };
    const result = passwordChangeSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("最小限の有効なパスワード長でバリデーション成功", () => {
    const minPassword = "a".repeat(8); // 最小8文字
    const input = {
      currentPassword: minPassword,
      newPassword: minPassword,
      confirmNewPassword: minPassword,
    };
    const result = passwordChangeSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  test("最大限の有効なパスワード長でバリデーション成功", () => {
    const maxPassword = "a".repeat(32); // 最大32文字
    const input = {
      currentPassword: maxPassword,
      newPassword: maxPassword,
      confirmNewPassword: maxPassword,
    };
    const result = passwordChangeSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
