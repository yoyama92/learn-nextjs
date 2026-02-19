import { beforeEach, describe, expect, test, vi } from "vitest";
import { markAllAsRead, markAsRead } from "../notifications";
import { ActionError } from "../../utils/error";

vi.mock("../../lib/session", () => {
  return {
    assertAdmin: vi.fn(),
    getSession: vi.fn(async () => {
      return null;
    }),
    requestSession: vi.fn(),
  };
});

describe("markAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("未認証エラーを返す", async () => {
    await expect(markAsRead(crypto.randomUUID())).rejects.toThrowError(
      ActionError,
    );
  });
});

describe("markAllAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("未認証エラーを返す", async () => {
    await expect(markAllAsRead([crypto.randomUUID()])).rejects.toThrowError(
      ActionError,
    );
  });
});
