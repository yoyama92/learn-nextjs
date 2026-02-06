import { PrismaClient } from "../src/generated/prisma";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

const main = async () => {
  const users = [
    {
      name: "Alice",
      email: "alice@example.com",
      password: "aaaaaaaa",
    },
    {
      name: "Bob",
      email: "Bob@example.com",
      password: "aaaaaaaa",
    },
  ];

  await Promise.all(
    users.map(
      async (user) =>
        await auth.api.signUpEmail({
          body: user,
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
