import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { logger } from "hono/logger";
import { handle } from "hono/vercel";
import { after } from "next/server";

import { auth } from "../../../lib/auth";
import { batchHandler } from "../../../lib/batch";
import { envStore } from "../../../lib/env";
import { exportUsersRequestSchema } from "../../../schemas/batch";
import { exportUsers } from "../../../server/services/batchService";
import { getProfileImage } from "../../../server/services/profileImageService";
import { ForbiddenError, NotFoundError } from "../../../utils/error";

export const dynamic = "force-dynamic";

const app = new Hono().basePath("/api");

app.use(logger());
app.get("/images/profile-image", async (c) => {
  const key = c.req.query("key");
  if (!key) {
    return c.json({ message: "invalid request" }, 400);
  }

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ message: "unauthorized" }, 401);
  }

  try {
    const { data, contentType } = await getProfileImage(key, {
      image: session.user.image,
    });

    return c.body(data, 200, {
      "Content-Type": contentType ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    });
  } catch (error) {
    switch (error instanceof Error) {
      case error instanceof NotFoundError:
        return c.json({ message: "not found" }, 404);
      case error instanceof ForbiddenError:
        return c.json({ message: "forbidden" }, 403);
      default:
        return c.json({ message: "internal server error" }, 500);
    }
  }
});
app
  .basePath("/batch")
  .use(bearerAuth({ token: envStore.BATCH_API_TOKEN }))
  .post("/export/users", zValidator("json", exportUsersRequestSchema), (c) => {
    const body = c.req.valid("json");

    // 実処理はレスポンス後に実行する。
    after(
      batchHandler(body, c.req.path, async (body) => {
        await exportUsers(body);
      }),
    );

    // バッチ処理は非同期で実行されるため、すぐにレスポンスを返す
    c.status(202);
    return c.json({
      success: true,
    });
  });

export const GET = handle(app);
export const POST = handle(app);
