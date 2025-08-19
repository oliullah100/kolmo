import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { MessageService } from "./message.service";
import httpStatus from 'http-status';
import ApiError from "../../errors/ApiErrors";

const getConversations = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const result = await MessageService.getConversationsFromDB(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Conversations fetched successfully',
      data: result,
    });
});

const getChatHistory = catchAsync(async (req, res) => {
    const { senderId, receiverId } = req.params;
    const result = await MessageService.getChatHistoryFromDB(senderId, receiverId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Chat history fetched successfully',
      data: result,
    });
});

const sendMessage = catchAsync(async (req, res) => {
    const { userId } = req.user;
    const messageData = { ...req.body, senderId: userId };
    const result = await MessageService.sendMessageToDB(messageData);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Message sent successfully',
      data: result,
    });
});

const markMessageAsRead = catchAsync(async (req, res) => {
    const { messageId } = req.params;
    const result = await MessageService.markMessageAsReadInDB(messageId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Message marked as read',
      data: result,
    });
});

const getUnreadCount = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const result = await MessageService.getUnreadCountFromDB(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Unread count fetched successfully',
      data: result,
    });
});

export const MessageController = {
    getConversations,
    getChatHistory,
    sendMessage,
    markMessageAsRead,
    getUnreadCount
} 