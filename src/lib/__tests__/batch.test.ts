import { describe, expect, test, vi } from "vitest";

import { batchHandler } from "../batch";

describe("batchHandler", () => {
  test("executorが正しく呼び出される", async () => {
    const mockExecutor = vi.fn().mockResolvedValue(undefined);
    const body = { action: "test", data: { id: 1 } };

    await batchHandler(body, "test", mockExecutor);

    expect(mockExecutor).toHaveBeenCalledWith(body);
    expect(mockExecutor).toHaveBeenCalledTimes(1);
  });

  test("executorに渡されたbodyが正しい", async () => {
    const mockExecutor = vi.fn().mockResolvedValue(undefined);
    const testBody = { id: 123, name: "test" };

    await batchHandler(testBody, "test", mockExecutor);

    expect(mockExecutor).toHaveBeenCalledWith(testBody);
  });
});
