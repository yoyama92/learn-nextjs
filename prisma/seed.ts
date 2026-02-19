import type { Prisma } from "../src/generated/prisma/client";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/server/infrastructures/db";

const generateData = (
  user1: {
    id: string;
    name: string;
  },
  user2: {
    id: string;
    name: string;
  },
) => {
  const data = Array.from(new Array(10), (_, index) => {
    return [
      {
        type: "info" as const,
        audience: "ALL",
        title: `${index}_ようこそ！`,
        body: "通知センターのUIサンプルです。これは info 通知です。",
      },
      {
        type: "warn" as const,
        audience: "SELECTED",
        title: `${index}_パスワード更新をおすすめします`,
        body: "長期間パスワードを変更していません。セキュリティのため更新してください。",
        recipients: {
          createMany: {
            data: [
              {
                userId: user1.id,
              },
              {
                userId: user2.id,
              },
            ],
          },
        },
      },
      {
        type: "security" as const,
        audience: "SELECTED",
        title: `${index}_新しい端末からのサインイン`,
        body: "新しい端末からサインインが検出されました。心当たりがない場合は対応してください。",
        recipients: {
          createMany: {
            data: [
              {
                userId: user1.id,
              },
            ],
          },
        },
      },
      {
        type: "security" as const,
        audience: "SELECTED",
        title: `${index}_${user1.name}には表示されない`,
        body: "新しい端末からサインインが検出されました。心当たりがない場合は対応してください。",
        recipients: {
          createMany: {
            data: [
              {
                userId: user2.id,
              },
            ],
          },
        },
      },
    ] satisfies Prisma.NotificationCreateInput[];
  });

  return data.flatMap((v) => [...v]);
};

const main = async () => {
  const users = [
    {
      name: "Alice",
      email: "alice@example.com",
      password: "aaaaaaaa",
      role: "admin" as const,
    },
    ...Array.from({ length: 50 }, (_, i) => {
      return {
        name: `Bob_${i}`,
        email: `bob+${i}@example.com`,
        password: "aaaaaaaa",
        role: "user" as const,
      };
    }),
  ];

  const usersWithRole = await Promise.all(
    users.map(async (user) => {
      return await auth.api.createUser({
        body: user,
      });
    }),
  );

  const user = usersWithRole[0]?.user;
  const user2 = usersWithRole[1]?.user;
  if (user && user2) {
    const data = generateData(
      {
        id: user.id,
        name: user.name,
      },
      {
        id: user2.id,
        name: user2.name,
      },
    );
    for (const v of data) {
      await prisma.notification.create({
        data: v,
      });
    }
  }
};

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
