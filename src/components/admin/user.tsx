import Link from "next/link";

type Props = {
  user: { name: string; email: string; isAdmin: boolean };
};

export const UserInfo = ({ user }: Props) => {
  return (
    <>
      <h2 className="text-lg font-bold">ユーザー情報</h2>
      <div className="flex flex-col gap-4 p-4 bg-base-100 border-base-300 rounded-box">
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
