import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { MessageController } from "./message.controller";
import { MessageValidation } from "./message.validation";

const router = express.Router();

// Chat routes (require authentication)
router.get('/conversations/:userId', auth(), MessageController.getConversations);
router.get('/:senderId/:receiverId', auth(), MessageController.getChatHistory);
router.post('/', auth(), validateRequest(MessageValidation.sendMessageSchema), MessageController.sendMessage);
router.patch('/:messageId/read', auth(), MessageController.markMessageAsRead);
router.get('/unread/:userId', auth(), MessageController.getUnreadCount);

export const MessageRoutes = router; 