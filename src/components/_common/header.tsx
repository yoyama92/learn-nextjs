import {
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { Suspense } from "react";

import { signOut } from "../../actions/auth";
import { getSession } from "../../lib/session";

const Menu = async () => {
  const session = await getSession();
  return (
    <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
      {session?.user && (
        <>
          <div className="px-3 py-2">
            <div className="font-bold">ログイン中</div>
            <div className="text-sm truncate">name: {session.user.name}</div>
            <div className="text-sm truncate">email: {session.user.email}</div>
          </div>
          <div className="divider my-1" />
        </>
      )}
      <li>
        <form className="block p-0" action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1 w-full text-left px-3 py-1"
          >
            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
            <span>ログアウト</span>
          </button>
        </form>
      </li>
    </ul>
  );
};

/**
 * ログイン後ページの共通ヘッダー
 */
export const Header = () => {
  return (
    <header className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">{/* レイアウト調整用 */}</div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            type="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Suspense fallback={<UserCircleIcon />}>
                <ProfileIcon />
              </Suspense>
            </div>
          </button>
          <Menu />
        </div>
      </div>
    </header>
  );
};

const ProfileIcon = async () => {
  const session = await getSession();
  const image = session?.user.image;

  if (image) {
    return (
      <Image
        src={image}
        alt="プロフィール画像"
        fill
        sizes="40px"
        className="rounded-full object-cover"
        unoptimized={true}
      />
    );
  }

  return <UserCircleIcon />;
};
