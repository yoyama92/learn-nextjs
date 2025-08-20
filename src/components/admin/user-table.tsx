"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Row = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const columnHelper = createColumnHelper<Row>();

const columns = [
  columnHelper.accessor((row) => row.name, {
    id: "name",
    header: "Name",
  }),
  columnHelper.accessor((row) => row.email, {
    id: "email",
    header: "Email",
  }),
  columnHelper.accessor((row) => row.isAdmin, {
    id: "role",
    header: "Role",
    cell: (info) => {
      const isAdmin = info.getValue();
      return isAdmin ? "Admin" : "User";
    },
  }),
  columnHelper.accessor((row) => row.createdAt, {
    id: "createdAt",
    header: "Created At",
    cell: (info) => {
      return info.getValue().toLocaleString("ja-JP");
    },
  }),
  columnHelper.accessor((row) => row.createdAt, {
    id: "updatedAt",
    header: "Updated At",
    cell: (info) => {
      return info.getValue().toLocaleString("ja-JP");
    },
  }),
];

export const UserTable = ({ rows }: { rows: Row[] }) => {
  const table = useReactTable({
    data: rows,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="table table-sm table-pin-rows table-pin-cols">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            <th></th>
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
