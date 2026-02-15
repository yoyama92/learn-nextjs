import { headers } from "next/headers";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { auth } from "../../lib/auth";
import { assertAdmin } from "../../lib/session";
import {
  createUser,
  getUsersPaginated,
} from "../../server/services/userService";
import { getUsers, postDeleteUser, postEditUser, postNewUser } from "../admin";

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

vi.mock("../../lib/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/session")>();
  return {
    assertAdmin: vi.fn((session) => {
      return actual.assertAdmin(session);
    }),
    getSession: vi.fn(async () => {
      const mockSession = {
        session: {
          id: "session-id",
        },
        user: {
          id: "admin-123",
          email: "admin@example.com",
          role: "admin",
          name: "Admin User",
        },
      };
      return mockSession;
    }),
    requestSession: vi.fn(async () => {
      const mockSession = {
        session: {
          id: "session-id",
        },
        user: {
          id: "admin-123",
          email: "admin@example.com",
          role: "admin",
          name: "Admin User",
        },
      };
      return mockSession;
    }),
  };
});

vi.mock("../../server/services/userService", () => ({
  createUser: vi.fn(),
  getUsersPaginated: vi.fn(),
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

    test("ユーザー作成時のエラー", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (createUser as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("DB error"),
      );

      await expect(
        postNewUser({
          name: "New User",
          email: "newuser@example.com",
          isAdmin: false,
        }),
      ).rejects.toThrow(Error);
    });

    test("assertAdmin で管理者権限をチェック", async () => {
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

      expect(assertAdmin).toHaveBeenCalled();
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

    test("API例外", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.removeUser as unknown as ReturnType<
          typeof vi.fn<typeof auth.api.removeUser>
        >
      ).mockRejectedValue(new Error("API error"));

      await expect(postDeleteUser({ id: "user-456" })).rejects.toThrow(Error);
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

      await expect(
        postEditUser({
          id: "user-456",
          name: "Updated User",
          email: "updated@example.com",
          isAdmin: false,
        }),
      ).rejects.toThrowError();
    });
  });

  describe("getUsers", () => {
    test("ユーザー情報を取得", async () => {
      const resolvedValue = {
        total: 100,
        pageSize: 10,
        totalPages: 10,
        currentPage: 1,
        users: [],
      };

      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        getUsersPaginated as ReturnType<typeof vi.fn<typeof getUsersPaginated>>
      ).mockResolvedValue(resolvedValue);

      const result = await getUsers({
        page: 1,
        pageSize: 10,
      });

      expect(result).toEqual(resolvedValue);
      expect(getUsersPaginated).toHaveBeenCalledWith(1, 10);
    });

    test("assertAdmin で管理者権限をチェック", async () => {
      const resolvedValue = {
        total: 100,
        pageSize: 10,
        totalPages: 10,
        currentPage: 1,
        users: [],
      };

      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        getUsersPaginated as ReturnType<typeof vi.fn<typeof getUsersPaginated>>
      ).mockResolvedValue(resolvedValue);

      await getUsers({
        page: 1,
        pageSize: 10,
      });

      expect(assertAdmin).toHaveBeenCalled();
    });
  });
});
