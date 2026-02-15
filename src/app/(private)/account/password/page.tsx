import type { Metadata } from "next";

import { definePrivatePage } from "../../../../components/_common/page";
import { PasswordChangeForm } from "../../../../components/auth/password-change";

export const metadata: Metadata = {
  title: "Change Password - Next.js Sample App",
};

/**
 * ログイン後のパスワード変更ページ
 */
export default definePrivatePage({
  name: "password",
}).page(async ({ session: { user } }) => {
  return (
    <PasswordChangeForm
      user={{
        email: user.email,
      }}
    />
  );
});
