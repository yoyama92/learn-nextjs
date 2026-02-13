import { headers } from "next/headers";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ForbiddenError, UnauthorizedError } from "../../utils/error";
import { auth } from "../auth";
import { type Session, requestSession } from "../session";

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

describe("requestSession", () => {
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

    const result = await requestSession();

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

    await expect(requestSession()).rejects.toThrow(UnauthorizedError);
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

    await expect(requestSession({ adminOnly: true })).rejects.toThrow(
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

    const result = await requestSession({ adminOnly: true });

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

    await requestSession();

    expect(headers).toHaveBeenCalled();
    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: mockHeaders,
    });
  });
});
