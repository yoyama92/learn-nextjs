import NextAuth, {
  CredentialsSignin,
  type DefaultSession,
  type Session,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { type Role, roleEnum, roleSchema, signInSchema } from "../schemas/auth";
import type { UserSchema } from "../schemas/user";
import { authorizeUser } from "../server/services/authService";
import { getUser, type UserGetResult } from "../server/services/userService";
import { forbidden, unauthorized } from "../utils/error";

export const { signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: roleEnum.user,
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = signInSchema.parse(credentials);

          // logic to verify if the user exists
          const user = await authorizeUser(email, password);
          if (!user) {
            throw new CredentialsSignin(`Invalid credentials. email: ${email}`);
          }

          // return JSON object with the user data
          return {
            id: user.id,
            role: roleEnum.user,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error;
          }
          console.error("[auth][error]authorize:", error);
          throw Error("原因不明のエラー");
        }
      },
    }),
    Credentials({
      id: roleEnum.admin,
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = signInSchema.parse(credentials);

          // logic to verify if the user exists
          const user = await authorizeUser(email, password, true);
          if (!user) {
            throw new CredentialsSignin(`Invalid credentials. email: ${email}`);
          }

          // return JSON object with the user data
          return {
            id: user.id,
            role: roleEnum.admin,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error;
          }
          console.error("[auth][error]authorize:", error);
          throw Error("原因不明のエラー");
        }
      },
    }),
  ],
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    session: async ({ token, session }) => {
      session.user.role =
        roleSchema.safeParse(token.role).data ?? session.user.role;
      session.user.id = token.sub ?? session.user.id;
      return session;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
  },
  logger: {
    error(code, ...message) {
      if (code instanceof CredentialsSignin) {
        console.warn("[auth][warn]CredentialsSignin:", code.message);
      } else if (code instanceof Error) {
        console.error(
          "[auth][error]",
          JSON.stringify(code),
          code["cause"],
          ...message,
        );
      } else {
        console.error("[auth][error]", JSON.stringify(code), message);
      }
    },
  },
});

export type AuthHandlerCallback<T> = (
  id: string,
  user: UserSchema,
) => Promise<T>;

/**
 * 認証・認可を検証してから実行する
 * ..param callback 実行したい処理
 * ..param options 認可設定
 * ..returns callbackの実行結果
 */
export const authHandler = async <T>(
  callback: AuthHandlerCallback<T>,
  options?: {
    adminOnly?: boolean;
  },
): Promise<T> => {
  const session = await auth();
  if (!session?.user?.id) {
    unauthorized();
  }

  const user = await getUser(session.user.id);
  if (user === null) {
    unauthorized();
  }

  // 管理者用URLは管理者権限があるユーザーが管理者としてログインしている場合のみ利用可能
  if (options?.adminOnly && !isAdminUser(session, user)) {
    forbidden();
  }

  return callback(session.user.id, user);
};

/**
 * 管理者としてログインしている管理者か判定する。
 * ..param session セッション
 * ..param dbUser DBから取得したユーザー情報
 * ..returns 管理者としてログインしている場合にtrueを返す。
 */
const isAdminUser = (session: Session, dbUser: UserGetResult) => {
  return session?.user.role === "admin" && dbUser?.role?.isAdmin;
};

type ExtendedUser = DefaultSession["user"] & {
  role: Role;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    role: Role;
  }
}
