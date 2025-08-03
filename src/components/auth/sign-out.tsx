"use client";

import { signOut } from "@/actions/auth";

export const SignOut = () => {
  return (
    <form
      action={async () => {
        await signOut();
      }}
    >
      <button type="submit" className="btn btn-outline">Sign Out</button>
    </form>
  );
};
