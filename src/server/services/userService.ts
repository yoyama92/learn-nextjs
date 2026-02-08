import type { Prisma } from "../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { envStore } from "../../lib/env";
import { generateRandomPassword } from "../../utils/password";
import { prisma } from "../infrastructures/db";
import { SendEmailCommand, sesClient } from "../infrastructures/ses";

const userSelectArg = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: true,
} satisfies Prisma.UserSelect;

type UserGetResult = Prisma.UserGetPayload<{
  select: typeof userSelectArg;
}>;

export const getUser = async (id: string): Promise<UserGetResult | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: userSelectArg,
  });
  return user;
};

const usersSelectArg = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: true,
} satisfies Prisma.UserSelect;

export const getUsers = async (): Promise<
  Prisma.UserGetPayload<{
    select: typeof usersSelectArg;
  }>[]
> => {
  const users = await prisma.user.findMany({
    select: usersSelectArg,
    orderBy: {
      createdAt: "asc",
    },
  });
  return users;
};

export const createUser = async (data: {
  name: string;
  email: string;
  isAdmin?: boolean;
}): Promise<{
  mailSent: boolean;
}> => {
  const newPassword = generateRandomPassword(
    12 + Math.floor(Math.random() * 4),
  );
  const createdUser = await auth.api.createUser({
    body: {
      name: data.name,
      email: data.email,
      password: newPassword,
      role: data.isAdmin ? "admin" : "user",
    },
  });

  try {
    const emailParams = {
      Destination: {
        ToAddresses: [createdUser.user.email],
      },
      Content: {
        Simple: {
          Subject: {
            Data: "Invitation to Join",
          },
          Body: {
            Text: {
              Data: `Your password is: ${newPassword}`,
            },
          },
        },
      },
      FromEmailAddress: envStore.AWS_SES_FROM_EMAIL || "",
    };
    const result = await sesClient.send(new SendEmailCommand(emailParams));
    return {
      mailSent: result.$metadata.httpStatusCode === 200,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      mailSent: false,
    };
  }
};
