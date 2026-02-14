import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { auth } from "../../lib/auth";
import type { Session } from "../../lib/session";
import { changePassword, resetPassword, signIn, signOut } from "../auth";

// モック化
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("../../lib/auth", () => ({
  auth: {
    api: {
      signInEmail: vi.fn(),
      signOut: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    },
  },
}));

vi.mock("../../lib/env", () => ({
  envStore: {
    BETTER_AUTH_URL: "http://localhost:3000",
  },
}));

const userSession = {
  user: {
    id: "user-123",
    email: "user@example.com",
    role: "user",
    name: "Test User",
    banned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: false,
  },
  session: {
    id: "session-123",
    token: "abc123",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
    userId: "user-123",
  },
} satisfies Session;

const adminSession = {
  user: {
    id: "admin-123",
    email: "admin@example.com",
    role: "admin",
    name: "Admin User",
    banned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: false,
  },
  session: {
    id: "session-123",
    token: "abc123",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
    userId: "admin-123",
  },
} satisfies Session;

describe("Auth Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    test("有効なメールとパスワードでサインイン成功（ユーザー）", async () => {
      const formData = new FormData();
      formData.append("email", "user@example.com");
      formData.append("password", "ValidPassword123!");

      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.signInEmail as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.signInEmail>
        >
      ).mockResolvedValue({
        redirect: false,
        token: "token",
        user: userSession.user,
      });

      await expect(signIn(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(redirect).toHaveBeenCalledWith("/account");
    });

    test("有効なメールとパスワードでサインイン成功（管理者）", async () => {
      const formData = new FormData();
      formData.append("email", "admin@example.com");
      formData.append("password", "AdminPassword123!");

      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.signInEmail as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.signInEmail>
        >
      ).mockResolvedValue({
        redirect: false,
        token: "token",
        user: adminSession.user,
      });

      await expect(signIn(undefined, formData)).rejects.toThrow(
        "NEXT_REDIRECT",
      );
      expect(redirect).toHaveBeenCalledWith("/admin");
    });

    test("無効なメールアドレスでエラーを返す", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "ValidPassword123!");

      const result = await signIn(undefined, formData);

      expect(result).toEqual({
        error: "メールアドレスもしくはパスワードが異なります。",
        formData: formData,
      });
      expect(auth.api.signInEmail).not.toHaveBeenCalled();
    });

    test("パスワードが短すぎるとエラーを返す", async () => {
      const formData = new FormData();
      formData.append("email", "user@example.com");
      formData.append("password", "short");

      const result = await signIn(undefined, formData);

      expect(result).toEqual({
        error: "メールアドレスもしくはパスワードが異なります。",
        formData: formData,
      });
    });

    test("UNAUTHORIZED エラーでメッセージを返す", async () => {
      const formData = new FormData();
      formData.append("email", "user@example.com");
      formData.append("password", "WrongPassword123!");

      const mockError = new APIError("UNAUTHORIZED");

      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.signInEmail as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(mockError);

      const result = await signIn(undefined, formData);

      expect(result).toEqual({
        error: "メールアドレスもしくはパスワードが異なります。",
        formData: formData,
        status: "UNAUTHORIZED",
      });
    });

    test("その他のエラーでシステムエラーメッセージを返す", async () => {
      const formData = new FormData();
      formData.append("email", "user@example.com");
      formData.append("password", "ValidPassword123!");

      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.signInEmail as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("System error"));

      const result = await signIn(undefined, formData);

      expect(result).toEqual({
        error: "システムエラーが発生しました。",
        formData: formData,
      });
    });

    test("入力フォームデータを保持して返す", async () => {
      const formData = new FormData();
      formData.append("email", "invalid");
      formData.append("password", "short");

      const result = await signIn(undefined, formData);

      expect(result.formData).toBe(formData);
    });
  });

  describe("signOut", () => {
    test("サインアウト成功時にリダイレクト", async () => {
      (
        auth.api.signOut as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.signOut>
        >
      ).mockResolvedValue({
        success: true,
      });
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});

      await expect(signOut()).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/sign-in");
    });

    test("サインアウト失敗時はリダイレクトしない", async () => {
      (
        auth.api.signOut as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.signOut>
        >
      ).mockResolvedValue({
        success: false,
      });
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await signOut();

      expect(result).toBeUndefined();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    test("有効なメールアドレスでリセット成功", async () => {
      const formData = new FormData();
      formData.append("email", "user@example.com");

      (
        auth.api.requestPasswordReset as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.requestPasswordReset>
        >
      ).mockResolvedValue({
        status: true,
        message: "",
      });

      const result = await resetPassword(undefined, formData);

      expect(result).toEqual({
        success: true,
        formData: formData,
      });
      expect(auth.api.requestPasswordReset).toHaveBeenCalledWith({
        body: {
          email: "user@example.com",
        },
      });
    });

    test("リセット失敗時はエラーメッセージを返す", async () => {
      const formData = new FormData();
      formData.append("email", "user@example.com");

      (
        auth.api.requestPasswordReset as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.requestPasswordReset>
        >
      ).mockResolvedValue({
        status: false,
        message: "",
      });

      const result = await resetPassword(undefined, formData);

      expect(result).toEqual({
        success: false,
        error: "パスワードの初期化に失敗しました。",
        formData: formData,
      });
    });

    test("無効なメールアドレスでエラー", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");

      const result = await resetPassword(undefined, formData);

      expect(result).toEqual({
        error: "メールアドレスを入力してください。",
        formData: formData,
      });
      expect(auth.api.requestPasswordReset).not.toHaveBeenCalled();
    });

    test("メールアドレスが空の場合エラー", async () => {
      const formData = new FormData();

      const result = await resetPassword(undefined, formData);

      expect(result).toEqual({
        error: "メールアドレスを入力してください。",
        formData: formData,
      });
    });

    test("API呼び出し時の例外をハンドル", async () => {
      const formData = new FormData();
      formData.append("email", "user@example.com");

      (
        auth.api.requestPasswordReset as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("API error"));

      const result = await resetPassword(undefined, formData);

      expect(result).toEqual({
        error: "システムエラーが発生しました。",
        formData: formData,
      });
    });
  });

  describe("changePassword", () => {
    test("有効なパスワード変更で成功", async () => {
      const token = "reset-token-123";

      (
        auth.api.resetPassword as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.resetPassword>
        >
      ).mockResolvedValue({
        status: true,
      });

      const result = await changePassword(token, {
        newPassword: "NewPassword123!",
        confirmNewPassword: "NewPassword123!",
      });

      expect(result).toEqual({
        success: true,
      });
      expect(auth.api.resetPassword).toHaveBeenCalledWith({
        body: {
          newPassword: "NewPassword123!",
          token: token,
        },
      });
    });

    test("パスワードが一致しないとバリデーション失敗", async () => {
      const token = "reset-token-123";

      const result = await changePassword(token, {
        newPassword: "NewPassword123!",
        confirmNewPassword: "DifferentPassword123!",
      });

      expect(result).toEqual({
        success: false,
      });
      expect(auth.api.resetPassword).not.toHaveBeenCalled();
    });

    test("パスワードが短すぎるとバリデーション失敗", async () => {
      const token = "reset-token-123";

      const result = await changePassword(token, {
        newPassword: "short",
        confirmNewPassword: "short",
      });

      expect(result).toEqual({
        success: false,
      });
    });

    test("API呼び出しエラーで失敗を返す", async () => {
      const token = "reset-token-123";

      (
        auth.api.resetPassword as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.resetPassword>
        >
      ).mockRejectedValue(new Error("API error"));

      const result = await changePassword(token, {
        newPassword: "NewPassword123!",
        confirmNewPassword: "NewPassword123!",
      });

      expect(result).toEqual({
        success: false,
      });
    });

    test("API returns false status", async () => {
      const token = "reset-token-123";

      (
        auth.api.resetPassword as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.resetPassword>
        >
      ).mockResolvedValue({
        status: false,
      });

      const result = await changePassword(token, {
        newPassword: "NewPassword123!",
        confirmNewPassword: "NewPassword123!",
      });

      expect(result).toEqual({
        success: false,
      });
    });
  });
});
