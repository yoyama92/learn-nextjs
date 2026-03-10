import { describe, expect, test } from "vitest";
import z from "zod";

import { bulkCreateUsersSchema, getPaginationSchema } from "../admin";

describe("getPaginationSchema", () => {
  test("バリデーション成功", () => {
    const input = {
      page: 1,
      pageSize: 1,
    };
    const result = getPaginationSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toStrictEqual(input);
    }
  });

  test("0以下のページは存在しない", () => {
    const input = {
      page: 0,
      pageSize: 1,
    };
    const result = getPaginationSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.treeifyError(result.error);
      expect(errors.properties?.page).toBeDefined();
    }
  });

  test("pageSize=100はOK", () => {
    const input = {
      page: 1,
      pageSize: 100,
    };
    const result = getPaginationSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toStrictEqual(input);
    }
  });

  test("pageSize=101はNG", () => {
    const input = {
      page: 1,
      pageSize: 101,
    };
    const result = getPaginationSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.treeifyError(result.error);
      expect(errors.properties?.pageSize).toBeDefined();
    }
  });

  test("pageSize=0はNG", () => {
    const input = {
      page: 1,
      pageSize: 0,
    };
    const result = getPaginationSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.treeifyError(result.error);
      expect(errors.properties?.pageSize).toBeDefined();
    }
  });
});

describe("bulkCreateUsersSchema", () => {
  test("バリデーション成功", () => {
    const input = {
      users: [
        {
          rowNumber: 2,
          name: "Alice",
          email: "alice@example.com",
        },
      ],
    };
    const result = bulkCreateUsersSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  test("101件はバリデーションエラー", () => {
    const input = {
      users: Array.from({ length: 101 }, (_, index) => {
        return {
          rowNumber: index + 2,
          name: `User${index}`,
          email: `user${index}@example.com`,
        };
      }),
    };
    const result = bulkCreateUsersSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  test("CSV内の重複メールアドレスをエラーにする", () => {
    const input = {
      users: [
        {
          rowNumber: 2,
          name: "Alice",
          email: "alice@example.com",
        },
        {
          rowNumber: 3,
          name: "Bob",
          email: "Alice@example.com",
        },
      ],
    };
    const result = bulkCreateUsersSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.message === "メールアドレスがCSV内で重複しています。",
        ),
      ).toBe(true);
    }
  });
});
