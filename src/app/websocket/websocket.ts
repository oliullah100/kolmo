import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import config from '../../config';

interface ConnectedUser {
    userId: string;
    ws: WebSocket;
    isOnline: boolean;
}

class WebSocketService {
    private wss: WebSocketServer;
    private connectedUsers: Map<string, ConnectedUser> = new Map();

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server });
        this.initialize();
    }

    private initialize() {
        this.wss.on('connection', (ws: WebSocket, request) => {
            this.handleConnection(ws, request);
        });
    }

    private handleConnection(ws: WebSocket, request: any) {
        // Extract token from query string
        const url = new URL(request.url, 'http://localhost');
        const token = url.searchParams.get('token');

        if (!token) {
            ws.close(1008, 'Authentication required');
            return;
        }

        try {
            // Verify JWT token
            const decoded = jwt.verify(token, config.jwt.access_secret as string) as any;
            const userId = decoded.id;

            // Store connected user
            this.connectedUsers.set(userId, {
                userId,
                ws,
                isOnline: true
            });

            // Send online status to other users
            this.broadcastUserStatus(userId, true);

            // Handle incoming messages
            ws.on('message', (data: string) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(userId, message);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            // Handle user disconnect
            ws.on('close', () => {
                this.handleDisconnect(userId);
            });

            // Handle errors
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.handleDisconnect(userId);
            });

            // Send connection confirmation
            ws.send(JSON.stringify({
                type: 'connection_established',
                userId: userId,
                message: 'Connected to chat server'
            }));

        } catch (error) {
            console.error('Authentication error:', error);
            ws.close(1008, 'Invalid token');
        }
    }

    private handleMessage(senderId: string, message: any) {
        switch (message.type) {
            case 'send_message':
                this.handleSendMessage(senderId, message);
                break;
            case 'typing_start':
                this.handleTypingStart(senderId, message);
                break;
            case 'typing_stop':
                this.handleTypingStop(senderId, message);
                break;
            case 'mark_read':
                this.handleMarkRead(senderId, message);
                break;
            case 'get_notifications':
                this.handleGetNotifications(senderId, message);
                break;
            case 'mark_notification_read':
                this.handleMarkNotificationRead(senderId, message);
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }

    private handleSendMessage(senderId: string, message: any) {
        const { receiverId, content, messageType = 'TEXT' } = message;

        // Send message to receiver if online
        const receiver = this.connectedUsers.get(receiverId);
        if (receiver && receiver.isOnline) {
            receiver.ws.send(JSON.stringify({
                type: 'new_message',
                senderId,
                content,
                messageType,
                timestamp: new Date().toISOString()
            }));
        }

        // Send confirmation to sender
        const sender = this.connectedUsers.get(senderId);
        if (sender) {
            sender.ws.send(JSON.stringify({
                type: 'message_sent',
                messageId: message.messageId,
                timestamp: new Date().toISOString()
            }));
        }
    }

    private handleTypingStart(senderId: string, message: any) {
        const { receiverId } = message;
        const receiver = this.connectedUsers.get(receiverId);
        
        if (receiver && receiver.isOnline) {
            receiver.ws.send(JSON.stringify({
                type: 'user_typing',
                userId: senderId,
                isTyping: true
            }));
        }
    }

    private handleTypingStop(senderId: string, message: any) {
        const { receiverId } = message;
        const receiver = this.connectedUsers.get(receiverId);
        
        if (receiver && receiver.isOnline) {
            receiver.ws.send(JSON.stringify({
                type: 'user_typing',
                userId: senderId,
                isTyping: false
            }));
        }
    }

    private handleMarkRead(senderId: string, message: any) {
        const { messageId, originalSenderId } = message;
        
        // Notify original sender that message was read
        const originalSender = this.connectedUsers.get(originalSenderId);
        if (originalSender && originalSender.isOnline) {
            originalSender.ws.send(JSON.stringify({
                type: 'message_read',
                messageId,
                readBy: senderId,
                timestamp: new Date().toISOString()
            }));
        }
    }

    private handleGetNotifications(senderId: string, message: any) {
        // This will be handled by the notification service
        // For now, just acknowledge the request
        const sender = this.connectedUsers.get(senderId);
        if (sender) {
            sender.ws.send(JSON.stringify({
                type: 'notifications_requested',
                timestamp: new Date().toISOString()
            }));
        }
    }

    private handleMarkNotificationRead(senderId: string, message: any) {
        const { notificationId } = message;
        
        // This will be handled by the notification service
        // For now, just acknowledge the request
        const sender = this.connectedUsers.get(senderId);
        if (sender) {
            sender.ws.send(JSON.stringify({
                type: 'notification_marked_read',
                notificationId,
                timestamp: new Date().toISOString()
            }));
        }
    }

    private handleDisconnect(userId: string) {
        this.connectedUsers.delete(userId);
        this.broadcastUserStatus(userId, false);
        console.log(`User ${userId} disconnected`);
    }

    private broadcastUserStatus(userId: string, isOnline: boolean) {
        const statusMessage = JSON.stringify({
            type: 'user_status',
            userId,
            isOnline,
            timestamp: new Date().toISOString()
        });

        // Broadcast to all other connected users
        this.connectedUsers.forEach((user, id) => {
            if (id !== userId && user.isOnline) {
                user.ws.send(statusMessage);
            }
        });
    }

    // Public method to send message to specific user
    public sendToUser(userId: string, message: any) {
        const user = this.connectedUsers.get(userId);
        if (user && user.isOnline) {
            user.ws.send(JSON.stringify(message));
        }
    }

    // Public method to broadcast to all users
    public broadcast(message: any) {
        const messageStr = JSON.stringify(message);
        this.connectedUsers.forEach((user) => {
            if (user.isOnline) {
                user.ws.send(messageStr);
            }
        });
    }

    // Get online users count
    public getOnlineUsersCount(): number {
        return this.connectedUsers.size;
    }

    // Check if user is online
    public isUserOnline(userId: string): boolean {
        const user = this.connectedUsers.get(userId);
        return user ? user.isOnline : false;
    }
}

export default WebSocketService; 