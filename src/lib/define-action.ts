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
  name: string;
  input: I;
  output: O;
  auth: A;
};

type SessionForAuth<A extends AuthMode> = A extends "public"
  ? Session
  : A extends "private"
    ? NonNullable<Session>
    : A extends "admin"
      ? NonNullable<Session>
      : never;

const buildDefineAction = (deps: {
  createContext: (opts: {
    name: string;
    auth: AuthMode;
  }) => Promise<ActionContext<AuthMode>>;
  assertAdmin: (session: NonNullable<Session>) => boolean;
}) => {
  const defineAction = <
    I extends z.ZodType,
    O extends z.ZodType,
    A extends AuthMode,
  >(
    options: DefineActionOptions<I, O, A>,
  ) => {
    const handler = (
      fn: (args: {
        ctx: ActionContext<A>;
        input: z.infer<I>;
      }) => Promise<z.infer<O>>,
    ) => {
      return async (rawInput: z.infer<I>): Promise<z.infer<O>> => {
        const ctx = await deps.createContext({
          name: options.name,
          auth: options.auth,
        });
        const log = ctx.logger;
        return runWithLogger(log, async () => {
          const started = Date.now();
          log.info({ event: "action_start" }, "start");
          try {
            // input validate
            const input = options.input.parse(rawInput);
            // auth
            if (options.auth !== "public") {
              if (!ctx.session) {
                throw new ActionError("UNAUTHORIZED");
              }

              if (options.auth === "admin" && !deps.assertAdmin(ctx.session)) {
                throw new ActionError("FORBIDDEN");
              }
            }

            // business
            const rawResult = await fn({
              ctx: {
                ...ctx,
                session: ctx.session as SessionForAuth<A>,
              },
              input,
            });

            // output validate
            const result = options.output.parse(rawResult);

            log.info(
              { event: "action_done", ms: Date.now() - started },
              "done",
            );
            return result;
          } catch (e) {
            // ZodError -> VALIDATION_ERROR（builder側で判定）
            const err =
              e instanceof z.ZodError
                ? new ActionError("VALIDATION_ERROR")
                : toActionError(e);

            log.error(
              { error: e, event: "action_error", ms: Date.now() - started },
              "error",
            );

            throw err;
          }
        });
      };
    };

    return { handler };
  };

  const defineAdminAction = <I extends z.ZodType, O extends z.ZodType>(
    o: Omit<DefineActionOptions<I, O, "admin">, "auth">,
  ) => {
    return defineAction<I, O, "admin">({
      ...o,
      auth: "admin",
    });
  };
  const definePrivateAction = <I extends z.ZodType, O extends z.ZodType>(
    o: Omit<DefineActionOptions<I, O, "private">, "auth">,
  ) => {
    return defineAction<I, O, "private">({
      ...o,
      auth: "private",
    });
  };

  return {
    defineAdminAction,
    definePrivateAction,
  };
};

export const { defineAdminAction, definePrivateAction } = buildDefineAction({
  createContext: async (opts) => {
    const adminOnly = opts.auth === "admin";
    const session = await getSession();
    const log = createRequestLogger(session, {
      action: opts.name,
      scope: "action",
      adminOnly: adminOnly,
    });
    return {
      // TODO requestIdの実装
      requestId: "1",
      logger: log,
      session: session,
    };
  },
  assertAdmin: assertAdmin,
});
