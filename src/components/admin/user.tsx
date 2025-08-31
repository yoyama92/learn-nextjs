import Link from "next/link";

import { type Row as ActivityRow, ActivityTable } from "./activity-table";

type Props = {
  user: {
    name: string;
    email: string;
    isAdmin: boolean;
    activities: ActivityRow[];
  };
};

export const UserInfo = ({ user }: Props) => {
  return (
    <>
      <h2 className="text-lg font-bold">ユーザー情報</h2>
      <div className="card bg-base-100">
        <div className="card-body">
          <div className="card-title">基本情報</div>
          <div className="flex flex-col ">
            <span>メールアドレス:{user.email}</span>
          </div>
          <div className="flex flex-col ">
            <span>名前:{user.name}</span>
          </div>
          <div className="flex flex-col ">
            <span>管理者フラグ:{`${user.isAdmin}`}</span>
          </div>
        </div>
      </div>
      <div className="card bg-base-100">
        <div className="card-body">
          <div className="card-title">操作履歴</div>
          <div className="overflow-x-auto max-h-[400px]">
            <ActivityTable rows={user.activities} />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div></div>
        <div>
          <Link type="button" className="btn btn-outline" href="/admin/users">
            一覧に戻る
          </Link>
        </div>
      </div>
    </>
  );
};
