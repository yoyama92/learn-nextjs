import { ActionError } from "../utils/error";
import type { StrictSerializable } from "../utils/serializable";
import { createRequestLogger } from "./logger";
import { runWithLogger } from "./request-context";
import { requestSession, type Session } from "./session";

/**
 * Action定義。認証・認可とログ設定などを行う。
 * @param fn 実行したい関数
 * @param opts 実行時の設定
 * @returns Actionとして定義する関数
 */
export const definePrivateAction = <T, K extends StrictSerializable>(
  fn: (input: K, session: NonNullable<Session>) => Promise<T>,
  opts: {
    actionName: string;
    adminOnly?: boolean;
  },
): ((args: K) => Promise<T>) => {
  return async (args: K): Promise<T> => {
    const session = await requestSession({
      adminOnly: opts.adminOnly,
    });
    const log = createRequestLogger(session, {
      action: opts.actionName,
      scope: "action",
      adminOnly: opts.adminOnly,
    });
    return runWithLogger(log, async () => {
      const started = Date.now();
      log.info({ event: "action_start" }, "start");
      try {
        const res = await fn(args, session);
        log.info({ event: "action_done", ms: Date.now() - started }, "done");
        return res;
      } catch (error) {
        log.error(
          { error, event: "action_error", ms: Date.now() - started },
          "error",
        );
        // クライアントにエラーの詳細を渡さないようにするためにエラーの中身は投げない。
        throw new ActionError(opts.actionName);
      }
    });
  };
};
