"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

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
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-xs opacity-70 line-clamp-2">{row.body}</div>
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
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
  });

  return (
    <table className="table table-zebra">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center">
              該当する通知がありません。
            </td>
          </tr>
        )}
        {table.getRowModel().rows.map((row) => {
          return (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
