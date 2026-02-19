import type { Prisma } from "../../generated/prisma/client";
import type { ListQuery } from "../../schemas/notification";
import { prisma } from "../infrastructures/db";

const notificationSelectArg = {
  id: true,
  type: true,
  title: true,
  body: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export const listNotifications = async (
  userId: string,
  query: ListQuery,
): Promise<{
  total: number;
  unreadCount: number;
  items: Prisma.NotificationGetPayload<{
    select: typeof notificationSelectArg;
  }>[];
}> => {
  const where = {
    userId,
    ...(query.tab === "unread"
      ? {
          readAt: null,
        }
      : {}),
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
        userId: userId,
        readAt: null,
      },
    }),
    prisma.notification.findMany({
      where: where,
      orderBy: { createdAt: "desc" },
      take: query.pageSize,
      skip: (query.page - 1) * query.pageSize,
      select: notificationSelectArg,
    }),
  ]);

  return {
    total,
    unreadCount,
    items,
  };
};

export const markNotificationAsRead = async (userId: string, id: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      id: id,
      userId: userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return {
    updated: result.count,
  };
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId: userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
  return {
    updated: result.count,
  };
};

export const deleteNotificationById = async (userId: string, id: string) => {
  const result = await prisma.notification.deleteMany({
    where: {
      id: id,
      userId: userId,
    },
  });
  return {
    deleted: result.count,
  };
};
