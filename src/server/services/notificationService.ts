import type { Prisma } from "../../generated/prisma/client";
import {
  type AdminNotificationListQuery,
  notificationAudienceEnum,
} from "../../schemas/admin-notification";
import type { ListQuery, NotificationType } from "../../schemas/notification";
import { prisma } from "../infrastructures/db";

const buildNotificationSelectArg = (userId: string) => {
  return {
    id: true,
    type: true,
    title: true,
    body: true,
    createdAt: true,
    recipients: {
      select: {
        readAt: true,
      },
      where: {
        // 既読のみ取得
        readAt: {
          not: null,
        },
        userId: userId,
      },
    },
  } satisfies Prisma.NotificationSelect;
};

export const listNotifications = async (
  userId: string,
  query: ListQuery,
): Promise<{
  total: number;
  unreadCount: number;
  items: {
    type: NotificationType;
    title: string;
    body: string;
    createdAt: Date;
    id: string;
    readAt: Date | null;
  }[];
}> => {
  const now = new Date();

  // 未読条件
  const unreadWhere = {
    OR: [
      // ALL通知で、このユーザーがまだ既読にしていない
      {
        audience: "ALL",
        recipients: {
          none: {
            userId,
            readAt: { not: null }, // 既読レコードが存在しない
          },
        },
      },
      // SELECTED通知で、このユーザー宛で未読
      {
        audience: "SELECTED",
        recipients: {
          some: {
            userId,
            readAt: null,
          },
        },
      },
    ],
  } satisfies Prisma.NotificationWhereInput;

  const where = {
    publishedAt: { lte: now },
    AND: [
      {
        OR: [
          {
            // 全員対象は無条件で取得
            audience: "ALL",
          },
          {
            // 対象指定の場合は対象の通知のみ取得
            audience: "SELECTED",
            recipients: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    ],
    ...(query.tab === "unread" ? unreadWhere : {}),
    ...(query.type !== "all"
      ? {
          type: query.type,
        }
      : {}),
    ...(query.q
      ? {
          OR: [
            {
              title: {
                contains: query.q,
                mode: "insensitive" as const,
              },
            },
            {
              body: {
                contains: query.q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  } satisfies Prisma.NotificationWhereInput;

  const [total, unreadCount, items] = await Promise.all([
    prisma.notification.count({
      where: where,
    }),
    prisma.notification.count({
      where: {
        AND: [
          {
            ...where,
          },
          {
            ...unreadWhere,
          },
        ],
      },
    }),
    prisma.notification.findMany({
      where: where,
      orderBy: { createdAt: "desc" },
      take: query.pageSize,
      skip: (query.page - 1) * query.pageSize,
      select: buildNotificationSelectArg(userId),
    }),
  ]);

  return {
    total,
    unreadCount,
    items: items.map((item) => {
      const { recipients, ...itemWithoutRecipient } = item;
      return {
        ...itemWithoutRecipient,
        readAt: recipients[0]?.readAt ?? null,
      };
    }),
  };
};

export const markNotificationAsRead = async (userId: string, id: string) => {
  const result = await prisma.notificationRecipient.upsert({
    where: {
      notificationId_userId: {
        notificationId: id,
        userId: userId,
      },
      readAt: null,
    },
    create: {
      readAt: new Date(),
      notificationId: id,
      userId: userId,
    },
    update: {
      readAt: new Date(),
    },
  });

  return {
    updated: result,
  };
};

export const markAllNotificationsAsRead = async (
  userId: string,
  notificationIds: string[],
) => {
  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    // 既存Recipientの未読を既読化
    const result = await tx.notificationRecipient.updateMany({
      where: {
        userId,
        readAt: null,
        notification: {
          id: { in: notificationIds },
          audience: "SELECTED",
          publishedAt: { lte: now },
          OR: [{ archivedAt: null }, { archivedAt: { gt: now } }],
        },
      },
      data: { readAt: now },
    });

    // 2) ALL: 既読レコードが無いものにも readAt を付けたいので、
    //    対象Notificationを拾って createMany（skipDuplicates）で既読レコードを作る
    const allIds = await tx.notification.findMany({
      where: {
        audience: "ALL",
        publishedAt: { lte: now },
        AND: [
          {
            OR: [{ archivedAt: null }, { archivedAt: { gt: now } }],
          },
          {
            recipients: {
              none: {
                userId,
                readAt: { not: null }, // 既読レコードが存在しない
              },
            },
          },
        ],
        id: { in: notificationIds },
      },
      select: { id: true },
    });

    if (allIds.length === 0) {
      return {
        updated: result.count,
      };
    }
    const recipientsCreated = await tx.notificationRecipient.createMany({
      data: allIds.map(({ id }) => ({
        notificationId: id,
        userId,
        readAt: now,
      })),
      skipDuplicates: true, // @@unique([notificationId, userId]) が前提
    });

    // すでにRecipientが存在してreadAt=nullのALL通知もあり得るなら、念のため更新
    const recipientsUpdated = await tx.notificationRecipient.updateMany({
      where: {
        userId,
        readAt: null,
        notificationId: { in: allIds.map((x) => x.id) },
      },
      data: { readAt: now },
    });
    return {
      updated: result.count + recipientsCreated.count + recipientsUpdated.count,
    };
  });
  return {
    updated: result?.updated,
  };
};

export const listAdminNotifications = async (
  query: AdminNotificationListQuery,
): Promise<{
  total: number;
  items: {
    id: string;
    title: string;
    body: string;
    type: "info" | "warn" | "security";
    audience: "ALL" | "SELECTED";
    publishedAt: Date | null;
    archivedAt: Date | null;
    createdAt: Date;
    status: "published" | "scheduled" | "archived";
  }[];
}> => {
  const now = new Date();
  const where = {
    ...(query.type !== "all"
      ? {
          type: query.type,
        }
      : {}),
    ...(query.audience !== notificationAudienceEnum.all
      ? {
          audience: query.audience,
        }
      : {}),
    ...(query.q
      ? {
          OR: [
            {
              title: {
                contains: query.q,
                mode: "insensitive" as const,
              },
            },
            {
              body: {
                contains: query.q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  } satisfies Prisma.NotificationWhereInput;

  const [total, items] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: query.pageSize,
      skip: (query.page - 1) * query.pageSize,
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        audience: true,
        publishedAt: true,
        archivedAt: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    total,
    items: items.map((item) => {
      const status =
        item.archivedAt !== null && item.archivedAt <= now
          ? "archived"
          : item.publishedAt !== null && item.publishedAt > now
            ? "scheduled"
            : "published";
      return {
        ...item,
        status,
      };
    }),
  };
};
