"use client";

import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";

import { signOut } from "../../actions/auth";

export const SignOut = () => {
  return (
    <button
      type="button"
      onClick={() => {
        signOut();
      }}
    >
      <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
      <span>ログアウト</span>
    </button>
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
