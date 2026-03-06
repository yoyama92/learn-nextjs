import type { MiddlewareHandler } from "hono";

import { auth } from "../../../lib/auth";
import { baseLogger } from "../../../lib/logger";
import { runWithLogger } from "../../../lib/request-context";
import type { Session } from "../../../lib/session";

type AppVariables = {
  session: Session | null;
};

export type AppEnv = {
  Variables: AppVariables;
};

export const resolveSessionMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next,
) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    c.set("session", session ?? null);
  } catch (error) {
    c.set("session", null);
    baseLogger.warn(
      {
        error,
        meta: {
          scope: "api",
          method: c.req.method,
          path: c.req.path,
        },
      },
      "Failed to resolve session",
    );
    return c.json({ message: "internal server error" }, 500);
  }

  await next();
};

export const pinoLoggerMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next,
) => {
  const requestId = crypto.randomUUID();
  const startTime = performance.now();
  const session = c.get("session");
  const user = session
    ? {
        id: session.user.id,
        role: session.user.role,
        sessionId: session.session.id,
      }
    : undefined;

  const log = baseLogger.child({
    context: {
      user,
    },
    meta: {
      scope: "api",
      requestId,
      method: c.req.method,
      path: c.req.path,
    },
  });

  await runWithLogger(log, async () => {
    log.info(
      {
        userAgent: c.req.header("user-agent"),
      },
      "HTTP request received",
    );

    try {
      await next();
      log.info(
        {
          status: c.res.status,
          durationMs: Math.round((performance.now() - startTime) * 100) / 100,
        },
        "HTTP request completed",
      );
    } catch (error) {
      log.error(
        {
          error,
          durationMs: Math.round((performance.now() - startTime) * 100) / 100,
        },
        "HTTP request failed",
      );
      throw error;
    }
  });
};

export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = c.get("session");

  if (!session) {
    return c.json({ message: "unauthorized" }, 401);
  }

  if (session.user.role !== "admin") {
    return c.json({ message: "forbidden" }, 403);
  }

  await next();
};
