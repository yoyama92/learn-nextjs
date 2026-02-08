import { headers } from "next/headers";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { auth } from "../../lib/auth";
import { authHandler } from "../../lib/session";
import { changePassword, postUser } from "../user";

// モック化
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("../../lib/auth", () => ({
  auth: {
    api: {
      updateUser: vi.fn(),
      changePassword: vi.fn(),
    },
  },
}));

vi.mock("../../lib/session", () => ({
  authHandler: vi.fn(async (callback) => {
    const mockUser = {
      id: "user-123",
      email: "user@example.com",
      role: "user",
      name: "Test User",
    };
    return callback("user-123", mockUser);
  }),
}));

describe("User Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postUser", () => {
    test("ユーザー情報を正常に更新", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.updateUser as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.updateUser>
        >
      ).mockResolvedValue({
        status: true,
      });

      const result = await postUser({
        name: "Updated Name",
      });

      expect(result).toEqual({
        status: true,
      });
      expect(auth.api.updateUser).toHaveBeenCalledWith({
        body: {
          name: "Updated Name",
        },
        headers: {},
      });
    });

    test("名前を空にして更新", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await postUser({
        name: "",
      });

      expect(result).toBeNull();
      expect(auth.api.updateUser).not.toBeCalled();
    });

    test("更新時のエラーをハンドル", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.updateUser as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Update failed"));

      const result = await postUser({
        name: "New Name",
      });

      expect(result).toBeNull();
    });

    test("authHandler を通じて認証をチェック", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.updateUser as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.updateUser>
        >
      ).mockResolvedValue({
        status: true,
      });

      await postUser({
        name: "New Name",
      });

      expect(authHandler).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("changePassword", () => {
    test("パスワードを正常に変更", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.changePassword as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.changePassword>
        >
      ).mockResolvedValue({
        token: null,
        user: {
          id: "user-123",
          email: "user@example.com",
          name: "Test User",
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
        },
      });

      const result = await changePassword({
        currentPassword: "OldPassword123!",
        newPassword: "NewPassword123!",
        confirmNewPassword: "NewPassword123!",
      });

      expect(result).toEqual({ success: true });
      expect(auth.api.changePassword).toHaveBeenCalledWith({
        body: {
          newPassword: "NewPassword123!",
          currentPassword: "OldPassword123!",
          revokeOtherSessions: true,
        },
        headers: {},
      });
    });

    test("新しいパスワードが一致しないとバリデーション失敗", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await changePassword({
        currentPassword: "OldPassword123!",
        newPassword: "NewPassword123!",
        confirmNewPassword: "DifferentPassword123!",
      });

      expect(result).toEqual({ success: false });
      expect(auth.api.changePassword).not.toHaveBeenCalled();
    });

    test("パスワードが短すぎるとバリデーション失敗", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await changePassword({
        currentPassword: "short",
        newPassword: "short",
        confirmNewPassword: "short",
      });

      expect(result).toEqual({ success: false });
    });

    test("API呼び出しエラーをハンドル", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.changePassword as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Password change failed"));

      const result = await changePassword({
        currentPassword: "OldPassword123!",
        newPassword: "NewPassword123!",
        confirmNewPassword: "NewPassword123!",
      });

      expect(result).toEqual({ success: false });
    });

    test("authHandler を通じて認証をチェック", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.changePassword as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.changePassword>
        >
      ).mockResolvedValue({
        token: null,
        user: {
          id: "user-123",
          email: "user@example.com",
          name: "Test User",
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: false,
        },
      });

      await changePassword({
        currentPassword: "OldPassword123!",
        newPassword: "NewPassword123!",
        confirmNewPassword: "NewPassword123!",
      });

      expect(authHandler).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
