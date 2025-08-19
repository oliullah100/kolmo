import { z } from "zod";

const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),
    content: z.string().min(1, "Message content is required"),
    messageType: z.enum(["TEXT", "LINK", "FILE", "IMAGE"]).default("TEXT"),
  }),
});

export const MessageValidation = {
  sendMessageSchema,
}; 