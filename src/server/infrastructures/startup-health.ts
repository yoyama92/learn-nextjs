import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { GetAccountCommand } from "@aws-sdk/client-sesv2";

import { auth } from "../../lib/auth";
import { envStore } from "../../lib/env";
import { baseLogger } from "../../lib/logger";
import { roleEnum } from "../../schemas/auth";
import { prisma } from "./db";
import { s3Client } from "./s3";
import { sesClient } from "./ses";

type HealthCheckStatus = "ok" | "ng" | "skip";

type HealthCheckResult = {
  service: "database" | "s3" | "ses" | "initial_data";
  status: HealthCheckStatus;
  ms: number;
  reason?: string;
};

const ensureInitialAdminUser = async () => {
  const email = envStore.INITIAL_ADMIN_EMAIL;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!existingUser) {
    await auth.api.createUser({
      body: {
        name: envStore.INITIAL_ADMIN_NAME,
        email,
        password: crypto.randomUUID(),
        role: roleEnum.admin,
      },
    });
  }
};

const ensureInitialData = async (): Promise<void> => {
  await ensureInitialAdminUser();
};

const checkInitialData = async (
  databaseStatus: HealthCheckStatus,
): Promise<HealthCheckResult> => {
  if (databaseStatus !== "ok") {
    return {
      service: "initial_data",
      status: "skip",
      ms: 0,
      reason: "database check failed",
    };
  }

  return runCheck("initial_data", async () => {
    await ensureInitialData();
  });
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

  const baseResults = await Promise.all([checkS3(), checkSes()]);
  const databaseResult = await checkDatabase();
  const initialDataResult = await checkInitialData(databaseResult.status);
  const results = [...baseResults, databaseResult, initialDataResult];

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
