import { prisma } from "../infrastructures/db";

export const addSignInActivity = async ({
  userId,
  asAdmin,
}: {
  userId: string;
  asAdmin: boolean;
}): Promise<{
  id: string;
}> => {
  return await prisma.activityHistory.create({
    data: {
      userId: userId,
      loginHistory: {
        create: {
          asAdmin: asAdmin,
        },
      },
    },
    select: {
      id: true,
    },
  });
};
