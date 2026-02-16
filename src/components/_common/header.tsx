import {
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { signOut } from "../../actions/auth";

/**
 * ログイン後ページの共通ヘッダー
 */
export const Header = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">{/* レイアウト調整用 */}</div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            type="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <UserCircleIcon />
            </div>
          </button>
          <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li>
              <form className="block p-0" action={signOut}>
                <button
                  type="submit"
                  className="flex items-center gap-1 w-full text-left px-2.5 py-1"
                >
                  <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                  <span>ログアウト</span>
                </button>
              </form>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
