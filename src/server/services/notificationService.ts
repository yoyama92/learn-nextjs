import type { Prisma } from "../../generated/prisma/client";
import {
  type AdminNotificationListQuery,
  type NotificationAudience,
  type NotificationStatus,
  notificationArchiveFilterEnum,
  notificationAudienceEnum,
} from "../../schemas/admin-notification";
import type { ListQuery, NotificationType } from "../../schemas/notification";
import { prisma } from "../infrastructures/db";

type NotificationDetailType = Exclude<NotificationType, "all">;
type NotificationDetailAudience = Exclude<
  NotificationAudience,
  typeof notificationAudienceEnum.all
>;

const toNotificationStatus = (input: {
  publishedAt: Date | null;
  archivedAt: Date | null;
}): NotificationStatus => {
  const now = new Date();
  return input.archivedAt !== null && input.archivedAt <= now
    ? "archived"
    : input.publishedAt !== null && input.publishedAt > now
      ? "scheduled"
      : "published";
};

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
    type: NotificationDetailType;
    audience: NotificationDetailAudience;
    publishedAt: Date | null;
    archivedAt: Date | null;
    createdAt: Date;
    status: NotificationStatus;
  }[];
}> => {
  const now = new Date();
  const archivedWhere =
    query.archived === notificationArchiveFilterEnum.archived
      ? ({
          archivedAt: { lte: now },
        } satisfies Prisma.NotificationWhereInput)
      : ({
          OR: [{ archivedAt: null }, { archivedAt: { gt: now } }],
        } satisfies Prisma.NotificationWhereInput);

  const where = {
    AND: [archivedWhere],
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
      return {
        ...item,
        status: toNotificationStatus(item),
      };
    }),
  };
};

export const archiveNotificationByAdmin = async (
  id: string,
): Promise<{
  updated: number;
}> => {
  const result = await prisma.notification.updateMany({
    where: {
      id,
      archivedAt: null,
    },
    data: {
      archivedAt: new Date(),
    },
  });

  return {
    updated: result.count,
  };
};

export const getAdminNotificationById = async (id: string) => {
  return await prisma.notification.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      audience: true,
      title: true,
      body: true,
      publishedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
      recipients: {
        select: {
          userId: true,
        },
      },
    },
  });
};

export const getAdminNotificationDetailById = async (id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      audience: true,
      title: true,
      body: true,
      publishedAt: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
      recipients: {
        select: {
          userId: true,
          readAt: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!notification) {
    return null;
  }

  return {
    ...notification,
    status: toNotificationStatus(notification),
  };
};

export const createNotificationByAdmin = async (input: {
  title: string;
  body: string;
  type: NotificationDetailType;
  audience: NotificationDetailAudience;
  recipientUserIds: string[];
  publishedAt: Date | null;
  archivedAt: Date | null;
}): Promise<{
  createdId: string;
}> => {
  const created = await prisma.$transaction(async (tx) => {
    const uniqueUserIds = Array.from(new Set(input.recipientUserIds));

    if (input.audience === "SELECTED") {
      const usersCount = await tx.user.count({
        where: {
          id: {
            in: uniqueUserIds,
          },
        },
      });

      if (usersCount !== uniqueUserIds.length) {
        throw new Error("選択された対象ユーザーが不正です。");
      }
    }

    const notification = await tx.notification.create({
      data: {
        title: input.title,
        body: input.body,
        type: input.type,
        audience: input.audience,
        publishedAt: input.publishedAt,
        archivedAt: input.archivedAt,
      },
      select: {
        id: true,
      },
    });

    if (input.audience === "SELECTED" && uniqueUserIds.length > 0) {
      await tx.notificationRecipient.createMany({
        data: uniqueUserIds.map((userId) => ({
          notificationId: notification.id,
          userId,
          readAt: null,
        })),
      });
    }

    return notification;
  });

  return {
    createdId: created.id,
  };
};

export const editNotificationByAdmin = async (input: {
  id: string;
  title: string;
  body: string;
  type: NotificationDetailType;
  audience: NotificationDetailAudience;
  recipientUserIds: string[];
  publishedAt: Date | null;
  archivedAt: Date | null;
}): Promise<{
  updated: number;
}> => {
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.notification.updateMany({
      where: {
        id: input.id,
      },
      data: {
        title: input.title,
        body: input.body,
        type: input.type,
        audience: input.audience,
        publishedAt: input.publishedAt,
        archivedAt: input.archivedAt,
      },
    });

    if (updated.count === 0) {
      return {
        updated: 0,
      };
    }

    if (input.audience === "SELECTED") {
      const uniqueUserIds = Array.from(new Set(input.recipientUserIds));
      const usersCount = await tx.user.count({
        where: {
          id: {
            in: uniqueUserIds,
          },
        },
      });

      if (usersCount !== uniqueUserIds.length) {
        throw new Error("選択された対象ユーザーが不正です。");
      }

      await tx.notificationRecipient.deleteMany({
        where: {
          notificationId: input.id,
          userId: {
            not: {
              in: uniqueUserIds,
            },
          },
        },
      });

      const existingRecipients = await tx.notificationRecipient.findMany({
        where: {
          notificationId: input.id,
        },
        select: {
          userId: true,
        },
      });

      const currentUserIdSet = new Set(
        existingRecipients.map((item) => item.userId),
      );
      const addUserIds = uniqueUserIds.filter(
        (userId) => !currentUserIdSet.has(userId),
      );

      if (addUserIds.length > 0) {
        await tx.notificationRecipient.createMany({
          data: addUserIds.map((userId) => ({
            notificationId: input.id,
            userId,
            readAt: null,
          })),
        });
      }
    } else {
      await tx.notificationRecipient.deleteMany({
        where: {
          notificationId: input.id,
          readAt: null,
        },
      });
    }

    return {
      updated: updated.count,
    };
  });

  return {
    updated: result.updated,
  };
};
