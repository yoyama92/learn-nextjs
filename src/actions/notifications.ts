"use server";

import { z } from "zod";

import { definePrivateAction, redirectBack } from "../lib/define-action";
import { idSchema } from "../schemas/notification";
import {
  deleteNotificationById,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../server/services/notificationService";

export const markAsRead = async (input: z.infer<typeof idSchema>) => {
  await definePrivateAction({
    input: idSchema,
    output: z.void(),
    name: "mark_as_read",
  }).handler(async ({ ctx: { session }, input }) => {
    await markNotificationAsRead(session.user.id, input.id);
  })(input);
  await redirectBack();
};

export const markAllAsRead = async () => {
  await definePrivateAction({
    input: z.void(),
    output: z.void(),
    name: "mark_all_as_read",
  }).handler(async ({ ctx: { session } }) => {
    await markAllNotificationsAsRead(session.user.id);
  })();
  await redirectBack();
};

export const deleteNotification = async (input: z.infer<typeof idSchema>) => {
  await definePrivateAction({
    input: idSchema,
    output: z.void(),
    name: "delete_notification",
  }).handler(async ({ ctx: { session }, input }) => {
    await deleteNotificationById(session.user.id, input.id);
  })(input);
  await redirectBack();
};
