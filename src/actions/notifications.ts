"use server";

import { z } from "zod";

import { definePrivateAction, redirectBack } from "../lib/define-action";
import { idSchema, idsSchema } from "../schemas/notification";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../server/services/notificationService";

export const markAsRead = async (input: z.infer<typeof idSchema>) => {
  await definePrivateAction({
    input: idSchema,
    output: z.void(),
    name: "mark_as_read",
  }).handler(async ({ ctx: { session }, input }) => {
    await markNotificationAsRead(session.user.id, input);
  })(input);
  await redirectBack();
};

export const markAllAsRead = async (input: z.infer<typeof idsSchema>) => {
  await definePrivateAction({
    input: idsSchema,
    output: z.void(),
    name: "mark_all_as_read",
  }).handler(async ({ ctx: { session }, input }) => {
    await markAllNotificationsAsRead(session.user.id, input);
  })(input);
  await redirectBack();
};
