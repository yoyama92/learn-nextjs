"use client";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { postDeleteNotification } from "../../../actions/admin-notification";
import type { AdminNotificationRow } from "./notification-list-types";
import {
  toAudienceLabel,
  toDateTimeLabel,
  toStatusLabel,
  toTypeLabel,
} from "./notification-list-types";

const columnHelper = createColumnHelper<AdminNotificationRow>();
const columns = [
  columnHelper.accessor((row) => row.title, {
    id: "title",
    header: "タイトル",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="max-w-64 md:max-w-md lg:max-w-xl truncate font-medium">
          {row.title}
        </div>
      );
    },
  }),
  columnHelper.accessor((row) => row.type, {
    id: "type",
    header: "種別",
    cell: (info) => toTypeLabel(info.getValue()),
  }),
  columnHelper.accessor((row) => row.audience, {
    id: "audience",
    header: "対象",
    cell: (info) => toAudienceLabel(info.getValue()),
  }),
  columnHelper.display({
    id: "status",
    header: "状態",
    cell: (info) => toStatusLabel(info.row.original.status),
  }),
  columnHelper.accessor((row) => row.publishedAt, {
    id: "publishedAt",
    header: "公開日時",
    cell: (info) => toDateTimeLabel(info.getValue()),
  }),
  columnHelper.accessor((row) => row.createdAt, {
    id: "createdAt",
    header: "作成日時",
    cell: (info) => toDateTimeLabel(info.getValue()),
  }),
];

export const AdminNotificationTable = ({
  items,
  total,
}: {
  items: AdminNotificationRow[];
  total: number;
}) => {
  const router = useRouter();
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
  });

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "この通知をアーカイブします。よろしいですか？",
    );
    if (!confirmed) {
      return;
    }

    const result = await postDeleteNotification({ id });
    if (result.success) {
      window.alert("アーカイブしました。");
      router.refresh();
      return;
    }
    window.alert(result.message);
  };

  return (
    <table className="table table-pin-rows table-pin-cols w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            <th></th>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
            <th></th>
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.length === 0 && (
          <tr>
            <td colSpan={8} className="text-center">
              該当する通知がありません。
            </td>
          </tr>
        )}
        {table.getRowModel().rows.map((row, index) => {
          return (
            <tr key={row.id}>
              <th>{index + 1}</th>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              <td>
                <div className="flex flex-row">
                  <div className="tooltip tooltip-top" data-tip="編集">
                    <button
                      type="button"
                      className="btn btn-ghost btn-square btn-sm"
                      onClick={() => {
                        router.push(`/admin/notifications/${row.original.id}/edit`);
                      }}
                    >
                      <PencilIcon className="w-5" />
                    </button>
                  </div>
                  <div className="tooltip tooltip-top" data-tip="アーカイブ">
                    <button
                      type="button"
                      className="btn btn-ghost btn-square btn-sm btn-error text-error hover:text-base-100"
                      onClick={async () => {
                        await handleDelete(row.original.id);
                      }}
                    >
                      <TrashIcon className="w-5" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
