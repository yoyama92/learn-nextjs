import { PrismaClient } from "@/generated/prisma";
import { saltAndHashPassword } from "@/utils/password";

const prisma = new PrismaClient();

const main = async () => {
  const alice = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@example.com",
      password: saltAndHashPassword("aaaaaaaa"),
    },
  });
  console.log({ alice });
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
