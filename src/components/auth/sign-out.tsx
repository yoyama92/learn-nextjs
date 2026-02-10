"use client";

import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";

import { signOut } from "../../actions/auth";

export const SignOut = () => {
  return (
    <form
      action={async () => {
        await signOut();
      }}
    >
      <button type="submit" className="flex flex-row gap-1 items-center">
        <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
        <span>ログアウト</span>
      </button>
    </form>
  );
};

export const SignOutButton = () => {
  return (
    <form
      action={async () => {
        await signOut();
      }}
    >
      <button type="submit" className="btn btn-outline">
        ログアウト
      </button>
    </form>
  );
};
