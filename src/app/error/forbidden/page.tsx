import Link from "next/link";

import { SignOutButton } from "../../../components/auth/sign-out";

export default function Forbidden() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h2 className="text-lg font-bold text-red-500">403 Forbidden</h2>
      <p>アクセス権限がありません。</p>
      <div className="flex flex-row gap-2">
        <div>
          <Link href="/" className="btn btn-outline">
            ホームに戻る
          </Link>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
