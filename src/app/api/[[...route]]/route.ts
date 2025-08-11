import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { logger } from "hono/logger";
import { handle } from "hono/vercel";
import { after } from "next/server";
export const dynamic = "force-dynamic";

import { batchHandler } from "@/lib/batch";
import { envStore } from "@/lib/env";
import { exportUsersRequestSchema } from "@/schemas/batch";
import { exportUsers } from "@/server/services/batchService";

const app = new Hono().basePath("/api");

app.use(logger());
app
  .basePath("/batch")
  .use(bearerAuth({ token: envStore.BATCH_API_TOKEN }))
  .post("/export/users", zValidator("json", exportUsersRequestSchema), (c) => {
    const body = c.req.valid("json");
    after(
      batchHandler(body, async (body) => {
        await exportUsers(body);
      }),
    );

    // バッチ処理は非同期で実行されるため、すぐにレスポンスを返す
    c.status(202);
    return c.json({
      success: true,
    });
  });

export const POST = handle(app);
