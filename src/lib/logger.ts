import pino from "pino";
import { envStore } from "./env";
import type { Session } from "./session";

const isDev = envStore.NODE_ENV === "development";

export const baseLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: { colorize: true },
      }
    : undefined,
});

export const createRequestLogger = (
  session?: Session,
  extra?: {
    scope: "page" | "action";
  } & Record<string, unknown>,
) => {
  const user = session?.user
    ? {
        id: session.user.id,
        role: session.user.role,
        sessionId: session.session.id,
      }
    : undefined;

  return baseLogger.child({
    context: {
      user,
    },
    meta: {
      ...extra,
    },
  });
};

export const createBatchLogger = (
  name?: string,
  extra?: Record<string, unknown>,
) => {
  return baseLogger.child({
    meta: {
      name,
      ...extra,
    },
  });
};
