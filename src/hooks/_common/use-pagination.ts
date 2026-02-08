import { useCallback, useState } from "react";

/**
 * ページネーションを管理するhook
 * @param initialData 初期値
 * @param  getData
 */
export const usePagination = <
  T extends {
    pageSize: number;
  },
>({
  initialData,
  getPageData,
}: {
  initialData: T;
  getPageData: (param: { page: number; pageSize: number }) => Promise<T>;
}): {
  data: T;
  handlePageChange: (page: number) => Promise<void>;
  isLoading: boolean;
} => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const newData = await getPageData({
          page: page,
          pageSize: data.pageSize,
        });
        setData(newData);
      } finally {
        setIsLoading(false);
      }
    },
    [data.pageSize, getPageData],
  );

  return {
    data,
    handlePageChange,
    isLoading,
  };
};
