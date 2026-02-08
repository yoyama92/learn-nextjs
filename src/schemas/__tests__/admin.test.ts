import { describe, expect, test } from "vitest";
import z from "zod";

import { getPaginationSchema } from "../admin";

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
