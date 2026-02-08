import { describe, expect, test } from "vitest";
import z from "zod";

import {
  changePasswordSchema,
  resetPasswordSchema,
  roleEnum,
  roleSchema,
  signInSchema,
} from "../auth";

describe("signInSchema", () => {
  test("有効なメールとパスワードでバリデーション成功", () => {
    const input = {
      email: "user@example.com",
      password: "ValidPassword123!",
    };
    const result = signInSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  test("無効なメールアドレス形式でバリデーション失敗", () => {
    const input = {
      email: "invalid-email",
      password: "ValidPassword123!",
    };
    const result = signInSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("パスワードが短すぎるとバリデーション失敗", () => {
    const input = {
      email: "user@example.com",
      password: "short",
    };
    const result = signInSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("パスワードが長すぎるとバリデーション失敗", () => {
    const input = {
      email: "user@example.com",
      password: "a".repeat(33),
    };
    const result = signInSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("メールアドレスが空のとバリデーション失敗", () => {
    const input = {
      email: "",
      password: "ValidPassword123!",
    };
    const result = signInSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  test("有効なメールアドレスでバリデーション成功", () => {
    const input = {
      email: "user@example.com",
    };
    const result = resetPasswordSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  test("無効なメールアドレス形式でバリデーション失敗", () => {
    const input = {
      email: "not-an-email",
    };
    const result = resetPasswordSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("メールアドレスが空のとバリデーション失敗", () => {
    const input = {
      email: "",
    };
    const result = resetPasswordSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  test("一致する新しいパスワードでバリデーション成功", () => {
    const input = {
      newPassword: "NewPassword123!",
      confirmNewPassword: "NewPassword123!",
    };
    const result = changePasswordSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  test("一致しない新しいパスワードでバリデーション失敗", () => {
    const input = {
      newPassword: "NewPassword123!",
      confirmNewPassword: "DifferentPassword123!",
    };
    const result = changePasswordSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.treeifyError(result.error);
      expect(errors.properties?.confirmNewPassword).toBeDefined();
      expect(
        errors.properties?.confirmNewPassword?.errors?.some((msg) =>
          msg.includes("一致しません"),
        ),
      ).toBe(true);
    }
  });

  test("新しいパスワードが短すぎるとバリデーション失敗", () => {
    const input = {
      newPassword: "short",
      confirmNewPassword: "short",
    };
    const result = changePasswordSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("新しいパスワードが長すぎるとバリデーション失敗", () => {
    const longPassword = "a".repeat(33);
    const input = {
      newPassword: longPassword,
      confirmNewPassword: longPassword,
    };
    const result = changePasswordSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("roleEnum", () => {
  test("roleEnumはフリーズされている", () => {
    expect(() => {
      // @ts-expect-error - テスト用に型を無視
      roleEnum.user = "modified";
    }).toThrow();
  });
});

describe("roleSchema", () => {
  test("userロールでバリデーション成功", () => {
    const result = roleSchema.safeParse("user");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("user");
    }
  });

  test("adminロールでバリデーション成功", () => {
    const result = roleSchema.safeParse("admin");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("admin");
    }
  });

  test("無効なロール値でバリデーション失敗", () => {
    const result = roleSchema.safeParse("superuser");
    expect(result.success).toBe(false);
  });

  test("空文字列でバリデーション失敗", () => {
    const result = roleSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});
