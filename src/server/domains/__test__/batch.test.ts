import { describe, expect, test } from "vitest";
import { buildExportUserFile } from "../batch";

describe("buildExportUserFile", () => {
  test("戻り値のテスト", () => {
    const users = [
      {
        id: "1",
        name: "管理者",
        email: "test@example.com",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date(0),
        deletedAt: null,
        role: {
          isAdmin: true,
        },
      },
      {
        id: "2",
        name: "一般ユーザー",
        email: "test2@example.com",
        createdAt: new Date(0),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
        deletedAt: new Date(0),
        role: null,
      },
    ];
    const result = buildExportUserFile(users, 0);

    expect(result.fileName).toBe("users-0.csv");
    expect(result.fileContent).toStrictEqual([
      [
        "1",
        "管理者",
        "test@example.com",
        "2025-01-01T00:00:00.000Z",
        "1970-01-01T00:00:00.000Z",
        "",
        "true",
      ],
      [
        "2",
        "一般ユーザー",
        "test2@example.com",
        "1970-01-01T00:00:00.000Z",
        "2025-01-01T00:00:00.000Z",
        "1970-01-01T00:00:00.000Z",
        "false",
      ],
    ]);
  });
});
