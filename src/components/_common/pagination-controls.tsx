"use client";

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

/**
 * TODO 適切な場所に移動してテストコードを書く。
 * ページネーションに表示するページの一覧を取得する。
 * 現在のページがなるべく真ん中に表示されるようにしつつ５ページ分だけ返す。
 * @param currentPage 現在のページ
 * @param totalPages 前ページ数。
 * @returns ページネーションに表示するページの一覧
 */
const getPages = (currentPage: number, totalPages: number): number[] => {
  const count = 5;
  // 末尾のページ
  const lastPage = Math.min(currentPage + Math.floor(count / 2), totalPages);

  // 表示する先頭のページ
  const firstPage = Math.max(1, lastPage - (count - 1));

  const pages = Array.from({ length: Math.min(count, totalPages) }, (_, i) => {
    const page = firstPage + i;
    if (page > totalPages) {
      return null;
    }
    return page;
  }).filter((page) => page !== null);
  return pages;
};

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => Promise<void>;
  isLoading: boolean;
}) => {
  const pages = getPages(currentPage, totalPages);
  return (
    <div className="flex flex-row justify-center items-center gap-4">
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1 || isLoading}
      >
        <ChevronDoubleLeftIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <div className="join">
        {pages.map((page) => {
          return (
            <button
              key={page}
              type="button"
              className={`join-item btn btn-sm ${
                currentPage === page ? "btn-active btn-primary" : "btn-ghost"
              }`}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
            >
              {page}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages || isLoading}
      >
        <ChevronDoubleRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
