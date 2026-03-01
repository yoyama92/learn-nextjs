import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { GetAccountCommand } from "@aws-sdk/client-sesv2";

import { envStore } from "../../lib/env";
import { baseLogger } from "../../lib/logger";
import { prisma } from "./db";
import { s3Client } from "./s3";
import { sesClient } from "./ses";

type HealthCheckStatus = "ok" | "ng" | "skip";

type HealthCheckResult = {
  service: "database" | "s3" | "ses";
  status: HealthCheckStatus;
  ms: number;
  reason?: string;
};

const runCheck = async (
  service: HealthCheckResult["service"],
  fn: () => Promise<void>,
): Promise<HealthCheckResult> => {
  const started = Date.now();

  try {
    await fn();
    return {
      service,
      status: "ok",
      ms: Date.now() - started,
    };
  } catch (error) {
    return {
      service,
      status: "ng",
      ms: Date.now() - started,
      reason: JSON.stringify(error),
    };
  }
};

const checkDatabase = async (): Promise<HealthCheckResult> => {
  return runCheck("database", async () => {
    await prisma.$queryRaw`SELECT 1`;
  });
};

const checkS3 = async (): Promise<HealthCheckResult> => {
  return runCheck("s3", async () => {
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: envStore.AWS_S3_BUCKET,
      }),
    );
  });
};

const checkSes = async (): Promise<HealthCheckResult> => {
  return runCheck("ses", async () => {
    await sesClient.send(new GetAccountCommand({}));
  });
};

/**
 * 起動時のヘルスチェック定義
 */
export const runStartupHealthChecks = async () => {
  const log = baseLogger.child({
    meta: {
      scope: "startup_health",
    },
  });

  log.info("Startup health checks started");

  const results = await Promise.all([checkDatabase(), checkS3(), checkSes()]);

  for (const result of results) {
    if (result.status === "ok") {
      log.info(
        {
          service: result.service,
          status: result.status,
          ms: result.ms,
        },
        "Startup health check passed",
      );
      continue;
    }

    if (result.status === "skip") {
      log.warn(
        {
          service: result.service,
          status: result.status,
          reason: result.reason,
        },
        "Startup health check skipped",
      );
      continue;
    }

    log.error(
      {
        service: result.service,
        status: result.status,
        ms: result.ms,
        reason: result.reason,
      },
      "Startup health check failed",
    );
  }

  const hasFailure = results.some((result) => result.status === "ng");

  if (hasFailure) {
    log.warn("Startup health checks completed with failures");
    return;
  }

  log.info("Startup health checks completed successfully");
};
