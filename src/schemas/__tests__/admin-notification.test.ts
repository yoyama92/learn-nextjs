import { describe, expect, test } from "vitest";
import z from "zod";

import {
  notificationFormSchema,
  notificationSchema,
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
    const result = notificationSchema.safeParse({
      ...baseInput,
      publishedAt: "2026-02-21T12:34",
      archivedAt: "",
    });

    expect(result.success).toBe(true);
  });

  test("UTCのZ付き日時は受け付けない", () => {
    const result = notificationSchema.safeParse({
      ...baseInput,
      publishedAt: "2026-02-21T12:34Z",
      archivedAt: "",
    });

    expect(result.success).toBe(false);
  });
});

test("指定ユーザー選択時はrecipientUserIdsが必須", () => {
  const result = notificationSchema.safeParse({
    ...baseInput,
    audience: notificationAudienceEnum.selectedUsers,
    recipientUserIds: undefined,
    publishedAt: "2026-02-21T12:34",
    archivedAt: "",
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    const errors = z.treeifyError(result.error);
    expect(errors.properties?.recipientUserIds?.errors).toContain(
      "対象ユーザーを1名以上選択してください。",
    );
  }
});

test("form schemaでも指定ユーザー選択時はrecipientUserIdsが必須", () => {
  const result = notificationFormSchema.safeParse({
    title: "title",
    body: "body",
    type: "info",
    audience: notificationAudienceEnum.selectedUsers,
    recipientUserIds: [],
    publishedAt: "2026-02-21T12:34",
    archivedAt: "",
    clientTimeZone: "Asia/Tokyo",
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    const errors = z.treeifyError(result.error);
    expect(errors.properties?.recipientUserIds?.errors).toContain(
      "対象ユーザーを1名以上選択してください。",
    );
  }
});
