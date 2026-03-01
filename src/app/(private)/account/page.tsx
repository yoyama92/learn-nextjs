import type { Metadata } from "next";

import { definePrivatePage } from "../../../components/_common/page";
import { UserInfo } from "../../../components/account/user";

export const metadata: Metadata = {
  title: "User Profile - Next.js Sample App",
};

/**
 * ユーザー情報ページ
 */
export default definePrivatePage({
  name: "account",
}).page(async ({ session: { user } }) => {
  return (
    <UserInfo
      user={{
        name: user.name,
        email: user.email,
        isAdmin: user.role === "admin",
        image: user.image,
      }}
    />
  );
});
