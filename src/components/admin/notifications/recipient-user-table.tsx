"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type RecipientRow = {
  userId: string;
  name: string;
  email: string;
  readAtLabel: string;
};

const columnHelper = createColumnHelper<RecipientRow>();
const columns = [
  columnHelper.accessor((row) => row.name, {
    id: "name",
    header: "ユーザー名",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row.email, {
    id: "email",
    header: "メールアドレス",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row.readAtLabel, {
    id: "readAtLabel",
    header: "既読日時",
    cell: (info) => info.getValue(),
  }),
];

/**
 * 通知の対象ユーザー一覧を固定高さで表示するテーブル。
 */
export const RecipientUserTable = ({ rows }: { rows: RecipientRow[] }) => {
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-64 overflow-auto rounded-box border border-base-300">
      <table className="table table-pin-rows table-zebra table-sm w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
