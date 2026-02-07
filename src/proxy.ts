import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";

import { publicPaths } from "./lib/path";

export async function proxy(req: NextRequest) {
  // エラーページは条件なく表示可能
  if (req.nextUrl.pathname === "/error/forbidden") {
    return;
  }

  // sessionの中身は各ページで検証する。
  // ここではcookieの有無だけを確認する。
  const cookie = getSessionCookie(req);

  // 未ログインの場合は公開されたパス以外にはアクセス不可
  if (!cookie && !publicPaths.test(req.nextUrl.pathname)) {
    const newUrl = new URL("/sign-in", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
