import { headers } from "next/headers";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ForbiddenError, UnauthorizedError } from "../../utils/error";
import { auth } from "../auth";
import { authHandler, type Session, verifySession } from "../session";

// モック化するモジュール
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("../auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
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

describe("verifySession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("セッションが存在する場合セッションを返す", async () => {
    const mockHeaders = {};
    (headers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHeaders,
    );
    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(userSession);

    const result = await verifySession();

    expect(result).toEqual(userSession);
  });

  test("セッションが存在しない場合unauthorized例外を投げる", async () => {
    const mockHeaders = {};
    (headers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHeaders,
    );

    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(null);

    await expect(verifySession()).rejects.toThrow(UnauthorizedError);
  });

  test("adminOnlyがtrueで管理者でない場合forbidden例外を投げる", async () => {
    const mockHeaders = {};
    (headers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHeaders,
    );
    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(userSession);

    await expect(verifySession({ adminOnly: true })).rejects.toThrow(
      ForbiddenError,
    );
  });

  test("adminOnlyがtrueで管理者の場合セッションを返す", async () => {
    const mockHeaders = {};
    (headers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHeaders,
    );
    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(adminSession);

    const result = await verifySession({ adminOnly: true });

    expect(result).toEqual(adminSession);
  });

  test("headersが正しく取得される", async () => {
    const mockHeaders = { authorization: "Bearer token" };

    (headers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHeaders,
    );
    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(userSession);

    await verifySession();

    expect(headers).toHaveBeenCalled();
    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: mockHeaders,
    });
  });
});

describe("authHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("callbackが正しい引数で呼ばれる", async () => {
    const mockHeaders = {};
    (headers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHeaders,
    );
    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(userSession);

    const callback = vi
      .fn()
      .mockResolvedValue({ success: true })
      .mockResolvedValueOnce({ data: "test" });

    const result = await authHandler(callback);

    expect(callback).toHaveBeenCalledWith(
      userSession.user.id,
      userSession.user,
    );
    expect(result).toEqual({ data: "test" });
  });

  test("callbackの戻り値が返される", async () => {
    const mockHeaders = {};
    (headers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHeaders,
    );
    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(userSession);

    const callback = vi.fn().mockResolvedValue({ result: "success" });

    const result = await authHandler(callback);

    expect(result).toEqual({ result: "success" });
  });

  test("adminOnlyオプションが正しく渡される", async () => {
    const mockHeaders = {};
    (headers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHeaders,
    );
    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(adminSession);

    const callback = vi.fn().mockResolvedValue({ result: "success" });

    const result = await authHandler(callback, { adminOnly: true });

    expect(result).toEqual({ result: "success" });
    expect(callback).toHaveBeenCalled();
  });

  test("adminOnlyオプションを渡されるが管理者でない場合エラーが投げられる", async () => {
    const mockHeaders = {};
    (headers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHeaders,
    );
    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(userSession);

    const callback = vi.fn().mockResolvedValue({ success: true });

    await expect(authHandler(callback, { adminOnly: true })).rejects.toThrow(
      ForbiddenError,
    );

    expect(callback).not.toHaveBeenCalled();
  });

  test("セッション検証に失敗した場合エラーが投げられる", async () => {
    const mockHeaders = {};
    (headers as ReturnType<typeof vi.fn>).mockResolvedValue(mockHeaders);
    (
      auth.api.getSession as unknown as ReturnType<
        typeof vi.fn<typeof auth.api.getSession>
      >
    ).mockResolvedValue(null);

    const callback = vi.fn();

    await expect(authHandler(callback)).rejects.toThrow(UnauthorizedError);

    expect(callback).not.toHaveBeenCalled();
  });
});
