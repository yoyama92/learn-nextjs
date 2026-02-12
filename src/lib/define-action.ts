import { createRequestLogger } from "./logger";
import { runWithLogger } from "./request-context";
import { authHandler, type Session } from "./session";

/**
 * Action定義。認証・認可とログ設定などを行う。
 * @param fn 実行したい関数
 * @param opts 実行時の設定
 * @returns Actionとして定義する関数
 */
export const definePrivateAction = <T, K>(
  fn: (input: K, session: NonNullable<Session>) => Promise<T>,
  opts?: {
    adminOnly?: boolean;
  },
): ((args: K) => Promise<T>) => {
  return async (args: K): Promise<T> => {
    return authHandler((session) => {
      const action = fn.name ?? "anonymous_action";
      const log = createRequestLogger(session, {
        action,
        scope: "action",
        ...opts,
      });
      return runWithLogger(log, async () => {
        log.info({ event: "action_start" }, "start");
        try {
          const res = await fn(args, session);
          log.info({ event: "action_done" }, "done");
          return res;
        } catch (error) {
          log.error({ error, event: "action_error" }, "error");
          // クライアントにエラーの詳細を渡さないようにするためにエラーの中身は投げない。
          throw new Error(action);
        }
      });
    }, opts);
  };
};
