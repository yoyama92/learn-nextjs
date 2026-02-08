import { describe, expect, test } from "vitest";

import {
  changePasswordSchema,
  resetPasswordSchema,
  roleEnum,
  roleSchema,
  signInSchema,
  type ChangePasswordSchema,
  type ResetPasswordSchema,
  type SignInSchema,
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

  test("型安全性: SignInSchemaの型推論", () => {
    const validData: SignInSchema = {
      email: "test@example.com",
      password: "ValidPassword123!",
    };
    expect(validData.email).toBeDefined();
    expect(validData.password).toBeDefined();
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

  test("型安全性: ResetPasswordSchemaの型推論", () => {
    const validData: ResetPasswordSchema = {
      email: "test@example.com",
    };
    expect(validData.email).toBeDefined();
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
      const errors = result.error.flatten();
      expect(errors.fieldErrors.confirmNewPassword).toBeDefined();
      expect(errors.fieldErrors.confirmNewPassword?.some((msg) =>
        msg.includes("一致しません"),
      )).toBe(true);
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

  test("型安全性: ChangePasswordSchemaの型推論", () => {
    const validData: ChangePasswordSchema = {
      newPassword: "ValidPassword123!",
      confirmNewPassword: "ValidPassword123!",
    };
    expect(validData.newPassword).toBeDefined();
    expect(validData.confirmNewPassword).toBeDefined();
  });
});

describe("roleEnum", () => {
  test("roleEnumが正しい値を持つ", () => {
    expect(roleEnum.user).toBe("user");
    expect(roleEnum.admin).toBe("admin");
  });

  test("roleEnumはフリーズされている", () => {
    expect(() => {
      // @ts-ignore - テスト用に型を無視
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
