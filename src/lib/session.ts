import { headers } from "next/headers";

import { forbidden, unauthorized } from "../utils/error";
import { auth } from "./auth";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

type AuthHandlerCallback<T> = (session: NonNullable<Session>) => Promise<T>;

/**
 * セッションの認証・認可処理
 * @param options.adminOnly 管理者のみ許可する場合にtrueを設定する。
 * @returns
 */
export const verifySession = async (options?: {
  adminOnly?: boolean;
}): Promise<NonNullable<Session>> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }

  if (options?.adminOnly && !isAdminUser(session)) {
    forbidden();
  }

  return session;
};

/**
 * 認証・認可を検証してから実行する
 * @param callback 実行したい処理
 * @param options 認可設定
 * @returns callbackの実行結果
 */
export const authHandler = async <T>(
  callback: AuthHandlerCallback<T>,
  options?: {
    adminOnly?: boolean;
    scope?: string;
    action?: string;
  },
): Promise<T> => {
  const session = await verifySession(options);
  return await callback(session);
};

/**
 * 管理者としてログインしている管理者か判定する。
 * @param session セッション
 * @param dbUser DBから取得したユーザー情報
 * @returns 管理者としてログインしている場合にtrueを返す。
 */
const isAdminUser = (session: Session) => {
  return session?.user?.role === "admin";
};
