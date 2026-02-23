"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import { getUsers } from "../../../actions/admin-user";
import { usePagination } from "../../../hooks/_common/use-pagination";
import { PaginationControls } from "../../_common/pagination-controls";
import { UserTable } from "./user-table";
import type { AdminUserRow } from "./user-types";

type TableData = Awaited<ReturnType<typeof getUsers>>;

export const UserListWithPagination = ({
  initialData,
}: {
  initialData: TableData;
}) => {
  const { handlePageChange, data, isLoading } = usePagination<TableData>({
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
  users: AdminUserRow[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    pageSize: number;
  };
  onPageChange: (page: number) => Promise<void>;
  isLoading: boolean;
}) => {
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
          <Link
            type="button"
            className="btn btn-sm max-sm:btn-square btn-primary"
            href="/admin/users/create"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="max-sm:hidden">新規登録</span>
          </Link>
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
