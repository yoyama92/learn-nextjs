import { describe, expect, test } from "vitest";

import {
  editNotificationSchema,
  notificationAudienceEnum,
} from "../admin-notification";

const baseInput = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "title",
  body: "body",
  type: "info" as const,
  audience: notificationAudienceEnum.allUsers,
  recipientUserIds: [],
  clientTimeZone: "Asia/Tokyo",
};

describe("editNotificationSchema datetime-local", () => {
  test("YYYY-MM-DDTHH:mm 形式を受け付ける", () => {
    const result = editNotificationSchema.safeParse({
      ...baseInput,
      publishedAt: "2026-02-21T12:34",
      archivedAt: "",
    });

    expect(result.success).toBe(true);
  });

  test("UTCのZ付き日時は受け付けない", () => {
    const result = editNotificationSchema.safeParse({
      ...baseInput,
      publishedAt: "2026-02-21T12:34Z",
      archivedAt: "",
    });

    expect(result.success).toBe(false);
  });
});
