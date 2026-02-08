import { headers } from "next/headers";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { auth } from "../../lib/auth";
import { authHandler } from "../../lib/session";
import { createUser } from "../../server/services/userService";
import { postDeleteUser, postEditUser, postNewUser } from "../admin";

// モック化
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("../../lib/auth", () => ({
  auth: {
    api: {
      removeUser: vi.fn(),
      adminUpdateUser: vi.fn(),
    },
  },
}));

vi.mock("../../lib/session", () => ({
  authHandler: vi.fn(async (callback) => {
    const mockUser = {
      id: "admin-123",
      email: "admin@example.com",
      role: "admin",
      name: "Admin User",
    };
    return callback("admin-123", mockUser);
  }),
}));

vi.mock("../../server/services/userService", () => ({
  createUser: vi.fn(),
}));

describe("Admin Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("postNewUser", () => {
    test("新規ユーザーを正常に作成", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        createUser as ReturnType<typeof vi.fn<typeof createUser>>
      ).mockResolvedValue({
        mailSent: true,
      });

      const result = await postNewUser({
        name: "New User",
        email: "newuser@example.com",
        isAdmin: false,
      });

      expect(result).toEqual({ mailSent: true });
      expect(createUser).toHaveBeenCalledWith({
        name: "New User",
        email: "newuser@example.com",
        isAdmin: false,
      });
    });

    test("管理者フラグ付きでユーザーを作成", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        createUser as ReturnType<typeof vi.fn<typeof createUser>>
      ).mockResolvedValue({
        mailSent: true,
      });

      const result = await postNewUser({
        name: "Admin User",
        email: "admin@example.com",
        isAdmin: true,
      });

      expect(result).toEqual({ mailSent: true });
      expect(createUser).toHaveBeenCalledWith({
        name: "Admin User",
        email: "admin@example.com",
        isAdmin: true,
      });
    });

    test("ユーザー作成時のエラーをハンドル", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (createUser as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("DB error"),
      );

      const result = await postNewUser({
        name: "New User",
        email: "newuser@example.com",
        isAdmin: false,
      });

      expect(result).toBeNull();
    });

    test("authHandler で管理者権限をチェック", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        createUser as ReturnType<typeof vi.fn<typeof createUser>>
      ).mockResolvedValue({
        mailSent: true,
      });

      await postNewUser({
        name: "New User",
        email: "newuser@example.com",
        isAdmin: false,
      });

      expect(authHandler).toHaveBeenCalledWith(expect.any(Function), {
        adminOnly: true,
      });
    });
  });

  describe("postDeleteUser", () => {
    test("他のユーザーを正常に削除", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.removeUser as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.removeUser>
        >
      ).mockResolvedValue({
        success: true,
      });

      const result = await postDeleteUser({ id: "user-456" });

      expect(result).toEqual({ success: true });
      expect(auth.api.removeUser).toHaveBeenCalledWith({
        body: { userId: "user-456" },
        headers: {},
      });
    });

    test("自分自身を削除しようとするとエラー", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await postDeleteUser({ id: "admin-123" });

      expect(result).toEqual({
        success: false,
        message: "自分自身は削除できません。",
      });
      expect(auth.api.removeUser).not.toHaveBeenCalled();
    });

    test("削除失敗時はエラーメッセージを返す", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.removeUser as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.removeUser>
        >
      ).mockResolvedValue({
        success: false,
      });

      const result = await postDeleteUser({ id: "user-456" });

      expect(result).toEqual({
        success: false,
        message: "削除に失敗しました。",
      });
    });

    test("API例外をハンドル", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.removeUser as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.removeUser>
        >
      ).mockRejectedValue(new Error("API error"));

      const result = await postDeleteUser({ id: "user-456" });

      expect(result).toEqual({
        success: false,
        message: "削除に失敗しました。",
      });
    });
  });

  describe("postEditUser", () => {
    test("ユーザー情報を正常に更新", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.adminUpdateUser as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.adminUpdateUser>
        >
      ).mockResolvedValue({
        id: "user-456",
        name: "Updated User",
        email: "updated@example.com",
        banned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false,
      });

      const result = await postEditUser({
        id: "user-456",
        name: "Updated User",
        email: "updated@example.com",
        isAdmin: false,
      });

      expect(result).toEqual({ success: true });
      expect(auth.api.adminUpdateUser).toHaveBeenCalledWith({
        body: {
          userId: "user-456",
          data: {
            name: "Updated User",
            email: "updated@example.com",
            role: "user",
          },
        },
        headers: {},
      });
    });

    test("管理者に昇格させる", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.adminUpdateUser as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.adminUpdateUser>
        >
      ).mockResolvedValue({
        id: "user-456",
        name: "Admin User",
        email: "admin@example.com",
        banned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false,
      });

      await postEditUser({
        id: "user-456",
        name: "Admin User",
        email: "admin@example.com",
        isAdmin: true,
      });

      expect(auth.api.adminUpdateUser).toHaveBeenCalledWith({
        body: {
          userId: "user-456",
          data: {
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
          },
        },
        headers: {},
      });
    });

    test("更新時のAPI例外をハンドル", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.adminUpdateUser as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.adminUpdateUser>
        >
      ).mockRejectedValue(new Error("Update failed"));

      const result = await postEditUser({
        id: "user-456",
        name: "Updated User",
        email: "updated@example.com",
        isAdmin: false,
      });

      expect(result).toBeNull();
    });
  });
});
