import { auth } from "../src/lib/auth";

const main = async () => {
  const users = [
    {
      name: "Alice",
      email: "alice@example.com",
      password: "aaaaaaaa",
      role: "admin" as const,
    },
    {
      name: "Bob",
      email: "Bob@example.com",
      password: "aaaaaaaa",
      role: "user" as const,
    },
  ];

  await Promise.all(
    users.map(async (user) => {
      return await auth.api.createUser({
        body: user,
      });
    }),
  );
};

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
