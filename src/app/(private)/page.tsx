import { redirect } from "next/navigation";

import { definePrivatePage } from "../../components/_common/page";

/**
 * ルートページ
 */
export default definePrivatePage({
  redirect: true,
  name: "home",
}).page(async ({ session }) => {
  // ログイン済みの場合は権限に応じてリダイレクトする
  if (session.user.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/account");
  }
});
