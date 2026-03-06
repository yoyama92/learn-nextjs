import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { handle } from "hono/vercel";
import { after } from "next/server";

import { batchHandler } from "../../../lib/batch";
import { envStore } from "../../../lib/env";
import { exportUsersRequestSchema } from "../../../schemas/batch";
import { buildExportUserFile } from "../../../server/domains/batch";
import { exportUsers } from "../../../server/services/batchService";
import { getProfileImage } from "../../../server/services/profileImageService";
import { getUsersForExport } from "../../../server/services/userService";
import { buildCSVContent } from "../../../utils/csv";
import { ForbiddenError, NotFoundError } from "../../../utils/error";
import {
  type AppEnv,
  pinoLoggerMiddleware,
  requireAdmin,
  resolveSessionMiddleware,
} from "./middleware";

export const dynamic = "force-dynamic";

const app = new Hono<AppEnv>().basePath("/api");
app.use(resolveSessionMiddleware);
app.use(pinoLoggerMiddleware);

const adminRoutes = new Hono<AppEnv>()
  .basePath("/admin")
  .use(requireAdmin)
  .get("/users/export.csv", async (c) => {
    const now = Math.floor(Date.now() / 1000);
    const users = await getUsersForExport();
    const { fileName, headers, fileContent } = buildExportUserFile(users, now);

    return c.body(buildCSVContent(headers, fileContent), 200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    });
  });

const imageRoutes = new Hono<AppEnv>().get("/images/profile-image", async (c) => {
  const key = c.req.query("key");
  if (!key) {
    return c.json({ message: "invalid request" }, 400);
  }

  const session = c.get("session");

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

const batchRoutes = new Hono<AppEnv>()
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

const route = app
  .route("/", adminRoutes)
  .route("/", imageRoutes)
  .route("/", batchRoutes);

export const GET = handle(route);
export const POST = handle(route);
export type AppType = typeof route;
