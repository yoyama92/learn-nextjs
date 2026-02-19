import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Logger } from "pino";
import z from "zod";

import { ActionError, toActionError } from "../utils/error";
import { createRequestLogger } from "./logger";
import { runWithLogger } from "./request-context";
import { assertAdmin, getSession, type Session } from "./session";

type AuthMode = "public" | "private" | "admin";

type ActionContext<A extends AuthMode> = {
  requestId: string;
  logger: Logger;
  session: SessionForAuth<A>;
};

type DefineActionOptions<
  I extends z.ZodType,
  O extends z.ZodType,
  A extends AuthMode,
> = {
  /**
   * アクション名
   */
  name: string;
  /**
   * 入力値のスキーマ
   */
  input: I;
  /**
   * 戻り値のスキーマ
   */
  output: O;
  /**
   * 要求する権限
   */
  auth: A;
};

type SessionForAuth<A extends AuthMode> = A extends "public"
  ? Session
  : A extends "private"
    ? NonNullable<Session>
    : A extends "admin"
      ? NonNullable<Session>
      : never;

type ActionDependencies = {
  createContext: (opts: {
    name: string;
    auth: AuthMode;
  }) => Promise<ActionContext<AuthMode>>;
  assertAdmin: (session: NonNullable<Session>) => boolean;
};

type ActionType<
  I extends z.ZodType,
  O extends z.ZodType,
  A extends AuthMode,
> = (args: { ctx: ActionContext<A>; input: z.infer<I> }) => Promise<z.infer<O>>;

export const redirectBack = async (fallback: string = "/"): Promise<never> => {
  const h = await headers();
  const referer = h.get("referer");
  if (!referer) {
    return redirect(fallback);
  }
  const url = new URL(referer);

  // 同一オリジンのみ許可
  const host = h.get("host");
  if (url.host !== host) {
    return redirect(fallback);
  }
  redirect(url.pathname + url.search);
};

/**
 * ctxの型をAction用に変換して返す。
 * 認証が必要なActionのときにSessionをNonNullableにすることが目的
 */
const getActionContext = <
  I extends z.ZodType,
  O extends z.ZodType,
  A extends AuthMode,
>(
  ctx: ActionContext<AuthMode>,
  options: DefineActionOptions<I, O, A>,
  assertAdmin: (session: NonNullable<Session>) => boolean,
) => {
  if (options.auth === "public") {
    return ctx;
  }

  if (!ctx.session) {
    throw new ActionError("UNAUTHORIZED");
  }

  if (options.auth === "admin" && !assertAdmin(ctx.session)) {
    throw new ActionError("FORBIDDEN");
  }

  return {
    ...ctx,
    session: ctx.session,
  };
};

const buildAction = async <
  I extends z.ZodType,
  O extends z.ZodType,
  A extends AuthMode,
>(
  fn: ActionType<I, O, A>,
  rawInput: z.infer<I>,
  deps: ActionDependencies,
  options: DefineActionOptions<I, O, A>,
) => {
  const ctx = await deps.createContext({
    name: options.name,
    auth: options.auth,
  });
  const log = ctx.logger;
  return runWithLogger(log, async () => {
    const started = Date.now();
    log.info({ event: "action_start" }, "start");
    try {
      // 入力値のバリデーション
      const input = options.input.parse(rawInput);

      const rawResult = await fn({
        ctx: getActionContext(ctx, options, deps.assertAdmin),
        input,
      });

      // 戻り値のバリデーション
      const result = options.output.parse(rawResult);

      log.info({ event: "action_done", ms: Date.now() - started }, "done");
      return result;
    } catch (error) {
      const err =
        error instanceof z.ZodError
          ? new ActionError("VALIDATION_ERROR")
          : toActionError(error);

      log.error(
        { error: error, event: "action_error", ms: Date.now() - started },
        "error",
      );

      throw err;
    }
  });
};

const defineAction = <
  I extends z.ZodType,
  O extends z.ZodType,
  A extends AuthMode,
>(
  deps: ActionDependencies,
  options: DefineActionOptions<I, O, A>,
) => {
  const handler = (fn: ActionType<I, O, A>) => {
    return async (rawInput: z.infer<I>): Promise<z.infer<O>> => {
      return await buildAction(fn, rawInput, deps, options);
    };
  };
  return { handler };
};

const buildDefineActions = (deps: ActionDependencies) => {
  // 管理者権限
  const defineAdminAction = <I extends z.ZodType, O extends z.ZodType>(
    o: Omit<DefineActionOptions<I, O, "admin">, "auth">,
  ) => {
    return defineAction<I, O, "admin">(deps, {
      ...o,
      auth: "admin",
    });
  };

  // 認証できていればよい
  const definePrivateAction = <I extends z.ZodType, O extends z.ZodType>(
    o: Omit<DefineActionOptions<I, O, "private">, "auth">,
  ) => {
    return defineAction<I, O, "private">(deps, {
      ...o,
      auth: "private",
    });
  };

  return {
    defineAdminAction,
    definePrivateAction,
  };
};

export const { defineAdminAction, definePrivateAction } = buildDefineActions({
  createContext: async (opts) => {
    const adminOnly = opts.auth === "admin";
    const session = await getSession();

    const requestId = crypto.randomUUID();
    const log = createRequestLogger(session, {
      action: opts.name,
      scope: "action",
      requestId: requestId,
      adminOnly: adminOnly,
    });

    return {
      requestId: requestId,
      logger: log,
      session: session,
    };
  },
  assertAdmin: assertAdmin,
});
