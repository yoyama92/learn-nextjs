import { auth } from "../src/lib/auth";
import { prisma } from "../src/server/infrastructures/db";

const generateData = (userId: string) => {
  const data = Array.from(new Array(10), (_, index) => {
    return [
      {
        userId: userId,
        type: "info" as const,
        title: `${index}_ようこそ！`,
        body: "通知センターのUIサンプルです。これは info 通知です。",
      },
      {
        userId: userId,
        type: "warn" as const,
        title: `${index}_パスワード更新をおすすめします`,
        body: "長期間パスワードを変更していません。セキュリティのため更新してください。",
      },
      {
        userId: userId,
        type: "security" as const,
        title: `${index}_新しい端末からのサインイン`,
        body: "新しい端末からサインインが検出されました。心当たりがない場合は対応してください。",
      },
    ];
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

  const userId = usersWithRole[0]?.user.id;
  if (userId) {
    await prisma.notification.createMany({
      data: generateData(userId),
    });
  }
};

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
