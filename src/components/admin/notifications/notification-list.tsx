"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { buildQuery } from "../../../utils/searchParams";
import { PaginationControls } from "../../_common/pagination-controls";
import type {
  AdminNotificationRow,
  AdminNotificationSearchParams,
} from "./notification-list-types";
import { AdminNotificationSearchForm } from "./notification-search-form";
import { AdminNotificationTable } from "./notification-table";

export const AdminNotificationList = ({
  items,
  total,
  searchParams,
  pageSize,
}: {
  items: AdminNotificationRow[];
  total: number;
  searchParams: AdminNotificationSearchParams;
  pageSize: number;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(searchParams.page, totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);
  const onPageChange = async (page: number) => {
    startTransition(() => {
      router.push(
        `/admin/notifications${buildQuery({
          page: String(page),
          q: searchParams.q,
          type: searchParams.type,
          audience: searchParams.audience,
          archived: searchParams.archived,
        })}`,
        { scroll: false },
      );
    });
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="text-lg font-bold">通知一覧</h2>
      <AdminNotificationSearchForm searchParams={searchParams} />

      <div className="w-full flex flex-col gap-4 p-4 bg-base-100 border-base-300 rounded-box">
        <div className="text-sm text-gray-600">
          全 {total} 件中 {from} 〜 {to} 件を表示
        </div>

        <div className="overflow-x-auto">
          <AdminNotificationTable items={items} total={total} />
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isPending}
        />
      </div>

      <Link href="/admin" className="link link-hover text-sm">
        トップページへ戻る
      </Link>
    </div>
  );
};
