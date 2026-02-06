import { headers } from "next/headers";

import type { UserSchema } from "../schemas/user";
import { unauthorized } from "../utils/error";
import { auth } from "./auth";

type AuthHandlerCallback<T> = (id: string, user: UserSchema) => Promise<T>;

type SessionUser = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * セッションの認証・認可処理
 * @param options.adminOnly 管理者のみ許可する場合にtrueを設定する。
 * @returns
 */
export const verifySession = async (options?: {
  adminOnly?: boolean;
}): Promise<SessionUser> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    unauthorized();
  }

  // if (options?.adminOnly && !isAdminUser(session, userInfo)) {
  //   forbidden();
  // }

  return session.user;
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
  },
): Promise<T> => {
  const user = await verifySession(options);

  return callback(user.id, user);
};

// /**
//  * 管理者としてログインしている管理者か判定する。
//  * @param session セッション
//  * @param dbUser DBから取得したユーザー情報
//  * @returns 管理者としてログインしている場合にtrueを返す。
//  */
// const isAdminUser = (session: Session, dbUser: UserGetResult) => {
//   return session?.user.role === "admin" && dbUser?.role?.isAdmin;
// };
