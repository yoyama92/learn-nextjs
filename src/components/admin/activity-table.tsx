"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type Row = {
  id: string;
  createdAt: Date;
  activity: string;
};

const columnHelper = createColumnHelper<Row>();

const columns = [
  columnHelper.accessor((row) => row.createdAt, {
    id: "date",
    header: "日時",
    size: 200,
    cell: (info) => {
      return info.getValue().toLocaleString("ja-JP");
    },
  }),
  columnHelper.accessor((row) => row.activity, {
    id: "activity",
    header: "操作内容",
  }),
];

export const ActivityTable = ({ rows }: { rows: Row[] }) => {
  const table = useReactTable({
    data: rows,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: Number.MAX_SAFE_INTEGER,
    },
  });

  return (
    <table className="table table-pin-rows table-pin-cols">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            <th className="w-12"></th>
            {headerGroup.headers.map((header) => {
              const size = header.getSize();
              return (
                <th
                  key={header.id}
                  style={{
                    width: size === Number.MAX_SAFE_INTEGER ? "auto" : size,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              );
            })}
            <th></th>
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row, index) => (
          <tr key={row.id}>
            <th>{index + 1}</th>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
