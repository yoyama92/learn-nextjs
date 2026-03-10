"use client";

import {
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

import { getUsers } from "../../../actions/admin-user";
import { useFileDownload } from "../../../hooks/_common/use-file-download";
import { usePagination } from "../../../hooks/_common/use-pagination";
import { apiClient } from "../../../lib/hono-rpc";
import type { GetPaginationResponseSchema } from "../../../schemas/admin";
import { PaginationControls } from "../../_common/pagination-controls";
import { UserTable } from "./user-table";

export const UserListWithPagination = ({
  initialData,
}: {
  initialData: GetPaginationResponseSchema;
}) => {
  const { handlePageChange, data, isLoading } =
    usePagination<GetPaginationResponseSchema>({
      initialData,
      getPageData: getUsers,
    });

  return (
    <UserList
      users={data.users}
      pagination={{
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total,
        pageSize: data.pageSize,
      }}
      onPageChange={handlePageChange}
      isLoading={isLoading}
    />
  );
};

const UserList = ({
  users,
  pagination,
  onPageChange,
  isLoading,
}: {
  users: GetPaginationResponseSchema["users"];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    pageSize: number;
  };
  onPageChange: (page: number) => Promise<void>;
  isLoading: boolean;
}) => {
  const { isDownloading: isDownloadingCsv, download } = useFileDownload();

  const handleDownloadCsv = async () => {
    try {
      await download({
        request: () => apiClient.api.admin.users["export.csv"].$get(),
      });
    } catch {
      window.alert("ユーザー一覧のダウンロードに失敗しました。");
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold">ユーザー一覧</h2>
      <div className="flex flex-col gap-4 p-4 bg-base-100 border-base-300 rounded-box">
        <div className="flex flex-row justify-between">
          <div className="text-sm text-gray-600">
            全 {pagination.total} 件中{" "}
            {(pagination.currentPage - 1) * pagination.pageSize + 1} 〜{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.total,
            )}{" "}
            件を表示
          </div>
          <div className="flex flex-row gap-2">
            <button
              type="button"
              className="btn btn-sm max-sm:btn-square btn-outline"
              onClick={handleDownloadCsv}
              disabled={isDownloadingCsv}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="max-sm:hidden">
                {isDownloadingCsv ? "出力中..." : "CSV出力"}
              </span>
            </button>
            <Link
              type="button"
              className="btn btn-sm max-sm:btn-square btn-outline"
              href="/admin/users/import"
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
              <span className="max-sm:hidden">CSV取込</span>
            </Link>
            <Link
              type="button"
              className="btn btn-sm max-sm:btn-square btn-primary"
              href="/admin/users/create"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="max-sm:hidden">新規登録</span>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <UserTable rows={users} total={pagination.total} />
        </div>
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      </div>
      <Link href="/admin" className="link link-hover text-sm">
        トップページへ戻る
      </Link>
    </>
  );
};
