import { headers } from "next/headers";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { auth } from "../../lib/auth";
import {
  changePassword,
  createProfileImageUploadUrl,
  postUser,
} from "../user";

vi.mock("../../server/services/profileImageService", () => ({
  createProfileImagePresignedUploadUrl: vi.fn(
    () => ({
      uploadUrl:
        "http://localhost:9000/my-bucket/profile-images/user-123/avatar.jpg?X-Amz-Signature=mock",
      imageUrl: "/api/users/profile-image?key=profile-images%2Fuser-123%2Favatar.jpg",
      profileImageUploadTokenTtlSeconds: 300,
    }),
  ),
}));

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

vi.mock("../../lib/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/session")>();
  return {
    ...actual,
    getSession: vi.fn(async () => {
      const mockSession = {
        session: {
          id: "session-id",
        },
        user: {
          id: "user-123",
          email: "user@example.com",
          role: "user",
          name: "Test User",
        },
      };
      return mockSession;
    }),
  };
});

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

    test("プロフィール画像URLを含めて更新", async () => {
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
        image: "/api/users/profile-image?key=profile-images%2Fuser-123%2Favatar.jpg",
      });

      expect(result).toEqual({
        status: true,
      });
      expect(auth.api.updateUser).toHaveBeenCalledWith({
        body: {
          name: "Updated Name",
          image:
            "/api/users/profile-image?key=profile-images%2Fuser-123%2Favatar.jpg",
        },
        headers: {},
      });
    });

    test("名前を空にして更新", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});

      await expect(
        postUser({
          name: "",
        }),
      ).rejects.toThrowError();
      expect(auth.api.updateUser).not.toBeCalled();
    });

    test("更新時のエラーをハンドル", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.updateUser as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Update failed"));

      await expect(
        postUser({
          name: "New Name",
        }),
      ).rejects.toThrowError();
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

      await expect(
        changePassword({
          currentPassword: "OldPassword123!",
          newPassword: "NewPassword123!",
          confirmNewPassword: "DifferentPassword123!",
        }),
      ).rejects.toThrowError();
      expect(auth.api.changePassword).not.toHaveBeenCalled();
    });

    test("パスワードが短すぎるとバリデーション失敗", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});

      await expect(
        changePassword({
          currentPassword: "short",
          newPassword: "short",
          confirmNewPassword: "short",
        }),
      ).rejects.toThrowError();
    });

    test("API呼び出しエラーをハンドル", async () => {
      (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
      (
        auth.api.changePassword as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Password change failed"));

      await expect(
        changePassword({
          currentPassword: "OldPassword123!",
          newPassword: "NewPassword123!",
          confirmNewPassword: "NewPassword123!",
        }),
      ).rejects.toThrowError();
    });
  });

  describe("createProfileImageUploadUrl", () => {
    test("署名付きURLを正常に発行", async () => {
      const result = await createProfileImageUploadUrl({
        fileName: "avatar.jpg",
        contentType: "image/jpeg",
        size: 1000,
      });

      expect(result).toEqual({
        uploadUrl:
          "http://localhost:9000/my-bucket/profile-images/user-123/avatar.jpg?X-Amz-Signature=mock",
        imageUrl:
          "/api/users/profile-image?key=profile-images%2Fuser-123%2Favatar.jpg",
        expiresInSeconds: 300,
      });
    });

    test("不正なMIMEタイプはバリデーション失敗", async () => {
      await expect(
        createProfileImageUploadUrl({
          fileName: "avatar.gif",
          contentType: "image/gif" as "image/jpeg",
          size: 1000,
        }),
      ).rejects.toThrowError();
    });
  });
});
