import { PrismaClient } from "../src/generated/prisma";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

const main = async () => {
  const users = [
    {
      name: "Alice",
      email: "alice@example.com",
      password: "aaaaaaaa",
      role: {
        isAdmin: true,
      },
    },
    {
      name: "Bob",
      email: "Bob@example.com",
      password: "aaaaaaaa",
      role: {
        isAdmin: false,
      },
    },
  ];
  await prisma.$transaction(
    async (tx) =>
      await Promise.all(
        users.map(async (user) => {
          const result = await auth.api.signUpEmail({
            body: user,
          });
          return await tx.userRole.create({
            data: {
              userId: result.user.id,
              isAdmin: user.role.isAdmin,
            },
            select: {
              userId: true,
            },
          });
        }),
      ),
  );
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
