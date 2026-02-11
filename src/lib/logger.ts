import pino from "pino";
import { envStore } from "./env";

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
