import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { usePagination } from "../../_common/use-pagination";

type Data = {
  pageSize: number;
  data: { id: string; name: string }[];
  page: number;
};

describe("usePagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("初期データで初期化される", () => {
    const initialData = {
      pageSize: 10,
      data: [{ id: "1", name: "User 1" }],
      page: 1,
    };

    const getPageData = vi.fn();

    const { result } = renderHook(() =>
      usePagination({
        initialData,
        getPageData,
      }),
    );

    expect(result.current.data).toEqual(initialData);
    expect(result.current.isLoading).toBe(false);
  });

  test("ページ変更時に新しいデータを取得する", async () => {
    const initialData = {
      pageSize: 10,
      data: [{ id: "1", name: "User 1" }],
      page: 1,
    };

    const newData = {
      pageSize: 10,
      data: [{ id: "2", name: "User 2" }],
      page: 2,
    };

    const getPageData = vi.fn<() => Promise<Data>>().mockResolvedValue(newData);

    const { result } = renderHook(() =>
      usePagination({
        initialData,
        getPageData,
      }),
    );

    await act(async () => {
      await result.current.handlePageChange(2);
    });

    expect(getPageData).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
    expect(result.current.data).toEqual(newData);
  });

  test("複数回のページ変更が正しく処理される", async () => {
    const initialData = {
      pageSize: 10,
      data: [{ id: "1", name: "User 1" }],
      page: 1,
    };

    const page2Data = {
      pageSize: 10,
      data: [{ id: "2", name: "User 2" }],
      page: 2,
    };

    const page3Data = {
      pageSize: 10,
      data: [{ id: "3", name: "User 3" }],
      page: 3,
    };

    const getPageData = vi.fn<(params: { page: number }) => Promise<Data>>(
      (params) => {
        if (params.page === 2) {
          return Promise.resolve(page2Data);
        }
        if (params.page === 3) {
          return Promise.resolve(page3Data);
        }
        return Promise.resolve(initialData);
      },
    );

    const { result } = renderHook(() =>
      usePagination({
        initialData,
        getPageData,
      }),
    );

    // ページ 1 → 2
    await act(async () => {
      await result.current.handlePageChange(2);
    });

    expect(result.current.data.page).toBe(2);
    expect(result.current.data).toBe(page2Data);

    // ページ 2 → 3
    await act(async () => {
      await result.current.handlePageChange(3);
    });
    expect(result.current.data.page).toBe(3);
    expect(result.current.data).toBe(page3Data);

    expect(getPageData).toHaveBeenCalledTimes(2);
  });
});
