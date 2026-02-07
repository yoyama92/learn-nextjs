import Link from "next/link";

export const AdminNavigation = () => {
  return (
    <div className="p-4">
      <ul className="list-inside list-disc">
        <li>
          <Link href="/admin/users" className="link link-hover text-sm">
            ユーザー一覧
          </Link>
        </li>
        <li>
          <Link href="/admin/users/create" className="link link-hover text-sm">
            ユーザー作成
          </Link>
        </li>
        <li>
          <Link href="/account" className="link link-hover text-sm">
            アカウントページ
          </Link>
        </li>
      </ul>
    </div>
  );
};
