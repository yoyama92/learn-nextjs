import { auth } from "./lib/auth";

/**
 * ログイン不要でアクセス可能なパス
 */
const publicPaths = ["/sign-in", "/password-reset", "/admin/sign-in"];

/**
 * 管理者画面のパス
 */
const adminPaths = ["/admin"];

export default auth((req) => {
  // 未ログインの場合は公開されたパス以外にはアクセス不可
  if (!req.auth && !publicPaths.includes(req.nextUrl.pathname)) {
    const newUrl = new URL("/sign-in", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // ログイン済みの場合は公開されたパスにはアクセス不可
  if (req.auth && publicPaths.includes(req.nextUrl.pathname)) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // 管理者としてログインしていない場合は管理者画面へのアクセスは不可
  if (
    req.auth?.user.role !== "admin" &&
    adminPaths.includes(req.nextUrl.pathname)
  ) {
    const newUrl = new URL("/error/forbidden", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
