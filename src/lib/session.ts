import { headers } from "next/headers";
import { redirect as nextRedirect } from "next/navigation";
import { cache } from "react";

import { forbidden, unauthorized } from "../utils/error";
import { auth } from "./auth";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export const getSession = cache(async (): Promise<Session> => {
  const reqHeaders = await headers();
  return auth.api.getSession({ headers: reqHeaders });
});

/**
 * セッションの認証・認可処理
 * @param options.adminOnly 管理者のみ許可する場合にtrueを設定する。
 * @returns
 */
export const requestSession = async (options?: {
  adminOnly?: boolean;
  redirect?: boolean;
}): Promise<NonNullable<Session>> => {
  const session = await getSession();
  if (!session) {
    if (options?.redirect) {
      nextRedirect("/sign-in");
    }
    unauthorized();
  }

  if (options?.adminOnly && !assertAdmin(session)) {
    forbidden();
  }

  return session;
};

/**
 * 管理者としてログインしている管理者か判定する。
 * @param session セッション
 * @param dbUser DBから取得したユーザー情報
 * @returns 管理者としてログインしている場合にtrueを返す。
 */
export const assertAdmin = (session: NonNullable<Session>) => {
  return session.user.role === "admin";
};
