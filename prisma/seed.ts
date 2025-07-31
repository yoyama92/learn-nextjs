import { type Prisma, PrismaClient } from "@/generated/prisma";
import { hashPassword } from "@/utils/password";

const prisma = new PrismaClient();

const main = async () => {
  const users: Prisma.UserCreateInput[] = [
    {
      name: "Alice",
      email: "alice@example.com",
      password: hashPassword("aaaaaaaa"),
      role: {
        create: {
          isAdmin: true,
        },
      },
    },
    {
      name: "Bob",
      email: "Bob@example.com",
      password: hashPassword("aaaaaaaa"),
      role: {
        create: {
          isAdmin: false,
        },
      },
    },
  ];
  await prisma.$transaction(
    async (tx) =>
      await Promise.all(
        users.map(
          async (user) =>
            await tx.user.create({
              data: user,
            }),
        ),
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
