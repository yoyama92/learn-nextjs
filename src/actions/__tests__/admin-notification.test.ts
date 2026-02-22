import { headers } from "next/headers";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  archiveNotificationByAdmin,
  createNotificationByAdmin,
  editNotificationByAdmin,
} from "../../server/services/notificationService";
import {
  postCreateNotification,
  postDeleteNotification,
  postEditNotification,
} from "../admin-notification";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("../../lib/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/session")>();
  return {
    assertAdmin: vi.fn((session) => {
      return actual.assertAdmin(session);
    }),
    getSession: vi.fn(async () => {
      return {
        session: { id: "session-id" },
        user: {
          id: "admin-123",
          email: "admin@example.com",
          role: "admin",
          name: "Admin User",
        },
      };
    }),
    requestSession: vi.fn(async () => {
      return {
        session: { id: "session-id" },
        user: {
          id: "admin-123",
          email: "admin@example.com",
          role: "admin",
          name: "Admin User",
        },
      };
    }),
  };
});

vi.mock("../../server/services/notificationService", () => ({
  archiveNotificationByAdmin: vi.fn(),
  createNotificationByAdmin: vi.fn(),
  editNotificationByAdmin: vi.fn(),
}));

describe("Admin Notification Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (headers as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  describe("postDeleteNotification", () => {
    test("通知を正常にアーカイブする", async () => {
      (
        archiveNotificationByAdmin as ReturnType<
          typeof vi.fn<typeof archiveNotificationByAdmin>
        >
      ).mockResolvedValue({
        updated: 1,
      });

      const result = await postDeleteNotification({
        id: "11111111-1111-4111-8111-111111111111",
      });

      expect(result).toEqual({ success: true });
      expect(archiveNotificationByAdmin).toHaveBeenCalledWith(
        "11111111-1111-4111-8111-111111111111",
      );
    });

    test("対象がない場合は失敗メッセージを返す", async () => {
      (
        archiveNotificationByAdmin as ReturnType<
          typeof vi.fn<typeof archiveNotificationByAdmin>
        >
      ).mockResolvedValue({
        updated: 0,
      });

      const result = await postDeleteNotification({
        id: "11111111-1111-4111-8111-111111111111",
      });

      expect(result).toEqual({
        success: false,
        message: "対象の通知が見つからないか、すでにアーカイブ済みです。",
      });
    });
  });

  describe("postEditNotification", () => {
    test("通知を正常に更新する", async () => {
      (
        editNotificationByAdmin as ReturnType<
          typeof vi.fn<typeof editNotificationByAdmin>
        >
      ).mockResolvedValue({
        updated: 1,
      });

      const result = await postEditNotification({
        id: "11111111-1111-4111-8111-111111111111",
        title: "title",
        body: "body",
        type: "info",
        audience: "SELECTED",
        recipientUserIds: ["22222222-2222-4222-8222-222222222222"],
        publishedAt: "2026-02-21T12:34",
        archivedAt: "",
        clientTimeZone: "Asia/Tokyo",
      });

      expect(result).toEqual({ success: true });
      expect(editNotificationByAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "11111111-1111-4111-8111-111111111111",
          title: "title",
          body: "body",
          type: "info",
          audience: "SELECTED",
          recipientUserIds: ["22222222-2222-4222-8222-222222222222"],
          publishedAt: new Date("2026-02-21T03:34:00.000Z"),
          archivedAt: null,
        }),
      );
    });

    test("更新対象がない場合は例外を投げる", async () => {
      (
        editNotificationByAdmin as ReturnType<
          typeof vi.fn<typeof editNotificationByAdmin>
        >
      ).mockResolvedValue({
        updated: 0,
      });

      await expect(
        postEditNotification({
          id: "11111111-1111-4111-8111-111111111111",
          title: "title",
          body: "body",
          type: "info",
          audience: "SELECTED",
          recipientUserIds: ["22222222-2222-4222-8222-222222222222"],
          publishedAt: "2026-02-21T12:34",
          archivedAt: "",
          clientTimeZone: "Asia/Tokyo",
        }),
      ).rejects.toThrow("Action failed");
    });
  });

  describe("postCreateNotification", () => {
    test("通知を正常に作成する", async () => {
      (
        createNotificationByAdmin as ReturnType<
          typeof vi.fn<typeof createNotificationByAdmin>
        >
      ).mockResolvedValue({
        createdId: "11111111-1111-4111-8111-111111111111",
      });

      const result = await postCreateNotification({
        title: "title",
        body: "body",
        type: "info",
        audience: "SELECTED",
        recipientUserIds: ["22222222-2222-4222-8222-222222222222"],
        publishedAt: "2026-02-21T12:34",
        archivedAt: "",
        clientTimeZone: "Asia/Tokyo",
      });

      expect(result).toEqual({ success: true });
      expect(createNotificationByAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "title",
          body: "body",
          type: "info",
          audience: "SELECTED",
          recipientUserIds: ["22222222-2222-4222-8222-222222222222"],
          publishedAt: new Date("2026-02-21T03:34:00.000Z"),
          archivedAt: null,
        }),
      );
    });
  });
});
