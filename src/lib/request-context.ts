import { AsyncLocalStorage } from "node:async_hooks";
import type { Logger } from "pino";
import { baseLogger } from "./logger";

type Store = {
  logger: Logger;
};

const als = new AsyncLocalStorage<Store>();

export const runWithLogger = <T>(logger: Logger, fn: () => T): T => {
  return als.run({ logger }, fn);
};

export const getLogger = (): Logger => {
  return als.getStore()?.logger ?? baseLogger;
};
