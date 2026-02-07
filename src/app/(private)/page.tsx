import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "../../lib/auth";

/**
 * ルートページ
 */
export default function Home() {
  return <AsyncPage />;
}

const AsyncPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // ルートページなの未ログインの直アクセスを想定してエラーではなくリダイレクトにする
  if (!session?.user) {
    redirect("/sign-in");
  }

  // ログイン済みの場合は権限に応じてリダイレクトする
  if (session.user.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/account");
  }
};
