import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";

import { prisma } from "../server/infrastructures/db";
import {
  findUserRoles,
  passwordReminder,
} from "../server/services/authService";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token }) => {
      await passwordReminder(user.email, token);
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    nextCookies(),
    customSession(async ({ user, session }) => {
      // セッションにRoleを追加する
      // DBからセッションを取得するときにまとめて取得したいが、
      // better-authの設計上ここで取得する形になる。
      const role = await findUserRoles(session.userId);
      return {
        role: role,
        user,
        session,
      };
    }),
  ],
});
