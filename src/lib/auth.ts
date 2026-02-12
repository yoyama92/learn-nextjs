import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { prisma } from "../server/infrastructures/db";
import { passwordReminder } from "../server/services/authService";
import { getLogger } from "./request-context";

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
  plugins: [nextCookies(), admin()],
  logger: {
    log: (level, message, ...args) => {
      const log = getLogger().child({
        context: {
          lib: "better-auth",
          args: args.length ? args : undefined,
        },
      });
      log[level](message);
    },
  },
});
