import { PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

import { UserTable } from "./user-table";

export const UserList = ({
  users,
}: {
  users: {
    id: string;
    name: string;
    email: string;
    isAdmin?: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}) => {
  return (
    <>
      <h2 className="text-lg font-bold">ユーザー一覧</h2>
      <div className="flex flex-col gap-4 p-4 bg-base-100 border-base-300 rounded-box">
        <div className="flex flex-row justify-between">
          <div></div>
          <Link
            type="button"
            className="btn btn-sm max-sm:btn-square btn-primary"
            href="/admin/users/create"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="max-sm:hidden">新規登録</span>
          </Link>
        </div>
        <div className="overflow-x-auto max-h-[400px]">
          <UserTable rows={users} />
        </div>
      </div>
      <Link href="/admin" className="link link-hover text-sm">
        トップページへ戻る
      </Link>
    </>
  );
};
