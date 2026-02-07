"use client";

import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { postDeleteUser } from "../../actions/admin";

type Row = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const ActionCell = ({
  onEditClick,
  onViewClick,
  onDeleteClick,
}: {
  onEditClick: () => void;
  onViewClick: () => void;
  onDeleteClick: () => void;
}) => {
  return (
    <div className="flex flex-row">
      <div className="tooltip tooltip-top" data-tip="編集">
        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm"
          onClick={() => {
            onEditClick();
          }}
        >
          <PencilIcon className="w-5" />
        </button>
      </div>
      <div className="tooltip tooltip-top" data-tip="詳細">
        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm"
          onClick={() => {
            onViewClick();
          }}
        >
          <EyeIcon className="w-5" />
        </button>
      </div>
      <div className="tooltip tooltip-top" data-tip="削除">
        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm btn-error text-error hover:text-base-100"
          onClick={() => {
            onDeleteClick();
          }}
        >
          <TrashIcon className="w-5" />
        </button>
      </div>
    </div>
  );
};

const columnHelper = createColumnHelper<Row>();

const columns = [
  columnHelper.accessor((row) => row.name, {
    id: "name",
    header: "名前",
  }),
  columnHelper.accessor((row) => row.email, {
    id: "email",
    header: "メールアドレス",
  }),
  columnHelper.accessor((row) => row.isAdmin, {
    id: "role",
    header: "ユーザー区分",
    cell: (info) => {
      const isAdmin = info.getValue();
      return isAdmin ? "管理者" : "一般ユーザー";
    },
  }),
  columnHelper.accessor((row) => row.createdAt, {
    id: "createdAt",
    header: "登録日時",
    cell: (info) => {
      return info.getValue().toLocaleString("ja-JP");
    },
  }),
  columnHelper.accessor((row) => row.updatedAt, {
    id: "updatedAt",
    header: "更新日時",
    cell: (info) => {
      return info.getValue().toLocaleString("ja-JP");
    },
  }),
];

const useDeleteDialog = ({
  done,
}: {
  done: () => void;
}): {
  showModal: (row: Row) => Promise<void>;
} => {
  return {
    showModal: async (row) => {
      const confirmed = window.confirm(
        "この操作は取り消せません。よろしいですか？",
      );
      if (!confirmed) {
        return;
      }

      const result = await postDeleteUser({
        id: row.id,
      });

      if (result.success) {
        window.alert("削除しました。");
        done();
      } else {
        window.alert(result.message);
      }
    },
  };
};

export const UserTable = ({ rows }: { rows: Row[] }) => {
  const table = useReactTable({
    data: rows,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const router = useRouter();
  const { showModal } = useDeleteDialog({
    done: () => {
      router.refresh();
    },
  });

  return (
    <table className="table table-pin-rows table-pin-cols">
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
            <td>
              <ActionCell
                onEditClick={() => {
                  router.push(`/admin/users/${row.original.id}/edit`);
                }}
                onViewClick={() => {
                  router.push(`/admin/users/${row.original.id}`);
                }}
                onDeleteClick={() => {
                  showModal(row.original);
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
