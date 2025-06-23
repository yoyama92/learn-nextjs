import NextAuth, { CredentialsSignin, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { signInSchema } from "@/lib/zod";
import { authorizeUser } from "@/server/services/authService";
import { getUser } from "@/server/services/userService";
import { unauthorized } from "@/utils/error";

export const { signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = signInSchema.parse(
            credentials,
          );

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
          throw Error("原因不明のエラー");
        }
      },
    }),
  ],
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
      } else {
        console.error("[auth][error]", code, message);
      }
    },
  },
});

export const authHandler = async <T>(
  callback: (id: string, user: User) => Promise<T>,
): Promise<T> => {
  const session = await auth();
  if (!session?.user?.id) {
    unauthorized();
  }

  const user = await getUser(session.user.id);
  if (user === null) {
    unauthorized();
  }

  return callback(session.user.id, user);
};
