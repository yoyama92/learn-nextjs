import NextAuth, { CredentialsSignin, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { signInSchema } from "@/schemas/auth";
import { authorizeUser } from "@/server/services/authService";
import { getUser } from "@/server/services/userService";
import { forbidden, unauthorized } from "@/utils/error";

export const { signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
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
      session.user.id = token.sub ?? session.user.id;
      return session;
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

export type AuthHandlerCallback<T> = (id: string, user: User) => Promise<T>;

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

  if (options?.adminOnly && !user.role?.isAdmin) {
    forbidden();
  }

  return callback(session.user.id, user);
};
