"use client";

import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";

import { signOut } from "../../actions/auth";

export const SignOut = () => {
  return (
    <form className="block p-0" action={signOut}>
      <button
        type="submit"
        className="flex items-center gap-1 w-full text-left px-2.5 py-1"
      >
        <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
        <span>ログアウト</span>
      </button>
    </form>
  );
};

export const SignOutButton = () => {
  return (
    <form action={signOut}>
      <button type="submit" className="btn btn-outline">
        ログアウト
      </button>
    </form>
  );
};
