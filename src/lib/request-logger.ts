import { baseLogger } from "./logger";
import type { Session } from "./session";

export const createRequestLogger = (
  session?: Session,
  extra?: Record<string, unknown>,
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
