import ApiError from "../../errors/ApiErrors";
import prisma from "../../lib/prisma"
import httpStatus from 'http-status';

// Get all conversations for a user
const getConversationsFromDB = async (userId: string) => {
    // Get all messages for the user
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ]
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                }
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Group messages by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(message => {
        const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
        const partner = message.senderId === userId ? message.receiver : message.sender;
        
        if (!conversationsMap.has(partnerId)) {
            conversationsMap.set(partnerId, {
                conversationUserId: partnerId,
                userName: partner.name,
                profilePicture: partner.profilePicture,
                lastMessage: message.content,
                lastMessageTime: message.createdAt,
                unreadCount: 0
            });
        }
    });

    // Get unread counts
    for (const [partnerId, conversation] of conversationsMap) {
        const unreadCount = await prisma.message.count({
            where: {
                senderId: partnerId,
                receiverId: userId,
                isRead: false
            }
        });
        conversation.unreadCount = unreadCount;
    }

    return Array.from(conversationsMap.values());
};

// Get chat history between two users
const getChatHistoryFromDB = async (senderId: string, receiverId: string) => {
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                }
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    return messages;
};

// Send a new message
const sendMessageToDB = async (messageData: {
    senderId: string;
    receiverId: string;
    content: string;
    messageType: string;
}) => {
    const result = await prisma.message.create({
        data: {
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            content: messageData.content,
            messageType: messageData.messageType as any,
            isRead: false,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                }
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                }
            }
        }
    });

    // Create notification for new message
    try {
        if (global.wsService) {
            const NotificationService = require('../notification/notification.service').default;
            const notificationService = new NotificationService(global.wsService);
            await notificationService.createNewMessageNotification(
                messageData.receiverId,
                result.sender.name
            );
        }
    } catch (error) {
        console.error('Error creating message notification:', error);
    }

    return result;
};

// Mark message as read
const markMessageAsReadInDB = async (messageId: string) => {
    const result = await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                }
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                }
            }
        }
    });

    return result;
};

// Get unread message count for a user
const getUnreadCountFromDB = async (userId: string) => {
    const count = await prisma.message.count({
        where: {
            receiverId: userId,
            isRead: false
        }
    });

    return { unreadCount: count };
};

export const MessageService = {
    getConversationsFromDB,
    getChatHistoryFromDB,
    sendMessageToDB,
    markMessageAsReadInDB,
    getUnreadCountFromDB
} 