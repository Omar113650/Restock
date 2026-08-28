// import {
//   ConnectedSocket,
//   MessageBody,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Logger } from '@nestjs/common';
// import { PrismaService } from '../../core/prisma/prisma.service';
// import { Server, Socket } from 'socket.io';

// interface NotificationSocket extends Socket {
//   userId?: string;
// }

// interface SubscribeNotificationsDto {
//   userId: string;
// }

// interface GetNotificationsDto {
//   userId: string;
//   page?: number;
//   limit?: number;
// }

// interface NotificationResponseDto {
//   id: string;
//   recipientId?: string;
//   type?: string;
//   message?: string;
//   relatedOrderId?: string | null;
//   relatedBatchId?: string | null;
//   isRead: boolean;
//   createdAt: Date;
//   [key: string]: any;
// }

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//     credentials: true,
//   },
//   namespace: '/notifications',
// })
// export class NotificationGateway
//   implements OnGatewayConnection, OnGatewayDisconnect
// {
//   private readonly logger = new Logger(NotificationGateway.name);

//   @WebSocketServer()
//   server: Server;

//   /**
//    * userId -> Set of socket IDs
//    *
//    * Example:
//    *
//    * user_123
//    *   ├── socket_1
//    *   ├── socket_2
//    *   └── socket_3
//    */
//   private connectedUsers = new Map<string, Set<string>>();

//   constructor(private readonly prismaService: PrismaService) {}

//
//   // CONNECTION
//

//   handleConnection(client: NotificationSocket) {
//     this.logger.log(`Client connected: ${client.id}`);

//     this.logger.log(`Connected clients: ${this.server.sockets.sockets.size}`);
//   }

//
//   // DISCONNECT
//

//   handleDisconnect(client: NotificationSocket) {
//     this.logger.log(`Client disconnected: ${client.id}`);

//     /**
//      * If this socket was registered to a user,
//      * remove it from that user's socket list.
//      */
//     if (client.userId) {
//       const userSockets = this.connectedUsers.get(client.userId);

//       if (userSockets) {
//         userSockets.delete(client.id);

//         // If user has no active sockets anymore
//         if (userSockets.size === 0) {
//           this.connectedUsers.delete(client.userId);
//         }
//       }

//       this.logger.log(`User ${client.userId} disconnected socket ${client.id}`);

//       return;
//     }

//     /**
//      * Fallback:
//      * If userId wasn't attached to the socket,
//      * search for the socket ID.
//      */
//     for (const [userId, socketIds] of this.connectedUsers.entries()) {
//       socketIds.delete(client.id);

//       if (socketIds.size === 0) {
//         this.connectedUsers.delete(userId);
//       }
//     }
//   }

//
//   // SUBSCRIBE TO NOTIFICATIONS
//

//   @SubscribeMessage('subscribe_notifications')
//   async handleSubscribeNotifications(
//     @ConnectedSocket() client: NotificationSocket,
//     @MessageBody() data: SubscribeNotificationsDto,
//   ) {
//     try {
//       const { userId } = data;

//       if (!userId) {
//         client.emit('error', {
//           message: 'userId is required',
//         });

//         return;
//       }

//       /**
//        * Store userId on socket
//        */
//       client.userId = userId;

//       /**
//        * Join user's private notification room
//        *
//        * Example:
//        * user_123
//        */
//       await client.join(`user_${userId}`);

//       /**
//        * Add socket to connected users map
//        */
//       if (!this.connectedUsers.has(userId)) {
//         this.connectedUsers.set(userId, new Set());
//       }

//       this.connectedUsers.get(userId)!.add(client.id);

//       /**
//        * Get current unread count
//        */
//       const unreadCount = await this.getUnreadCount(userId);

//       /**
//        * Tell frontend subscription succeeded
//        */
//       client.emit('subscribed', {
//         message: 'Subscribed to notifications',
//         userId,
//         unreadCount,
//       });

//       /**
//        * Send unread count immediately
//        */
//       client.emit('unread_count', {
//         count: unreadCount,
//       });

//       this.logger.log(
//         `Socket ${client.id} subscribed to notifications for user ${userId}`,
//       );
//     } catch (error) {
//       this.logger.error(
//         `Error subscribing socket ${client.id}: ${
//           error instanceof Error ? error.message : String(error)
//         }`,
//       );

//       client.emit('error', {
//         message: 'Failed to subscribe to notifications',
//       });
//     }
//   }

//
//   // UNSUBSCRIBE FROM NOTIFICATIONS
//

//   @SubscribeMessage('unsubscribe_notifications')
//   async handleUnsubscribeNotifications(
//     @ConnectedSocket() client: NotificationSocket,
//   ) {
//     try {
//       if (!client.userId) {
//         client.emit('error', {
//           message: 'Socket is not subscribed to any user',
//         });

//         return;
//       }

//       const userId = client.userId;

//       /**
//        * Leave notification room
//        */
//       await client.leave(`user_${userId}`);

//       /**
//        * Remove socket from connected users
//        */
//       const userSockets = this.connectedUsers.get(userId);

//       if (userSockets) {
//         userSockets.delete(client.id);

//         if (userSockets.size === 0) {
//           this.connectedUsers.delete(userId);
//         }
//       }

//       /**
//        * Remove userId from socket
//        */
//       delete client.userId;

//       client.emit('unsubscribed', {
//         message: 'Unsubscribed from notifications',
//       });

//       this.logger.log(`Socket ${client.id} unsubscribed from user ${userId}`);
//     } catch (error) {
//       this.logger.error(
//         `Error unsubscribing socket ${client.id}: ${error instanceof Error ? error.message : String(error)}`,
//       );

//       client.emit('error', {
//         message: 'Failed to unsubscribe from notifications',
//       });
//     }
//   }

//
//   // GET NOTIFICATIONS
//

//   @SubscribeMessage('get_notifications')
//   async handleGetNotifications(
//     @ConnectedSocket() client: NotificationSocket,
//     @MessageBody() data: GetNotificationsDto,
//   ) {
//     try {
//       const { userId } = data;

//       if (!userId) {
//         client.emit('error', {
//           message: 'userId is required',
//         });

//         return;
//       }

//       /**
//        * Make sure socket belongs to this user
//        *
//        * This is NOT authentication.
//        * It's just to keep the current socket state consistent.
//        */
//       if (client.userId !== userId) {
//         client.emit('error', {
//           message: 'Subscribe to this user first',
//         });

//         return;
//       }

//       const page = Math.max(data.page || 1, 1);

//       const limit = Math.min(Math.max(data.limit || 10, 1), 50);

//       const skip = (page - 1) * limit;

//       /**
//        * Get notifications
//        */
//       const notifications = await this.prismaService.notification.findMany({
//         where: {
//           recipientId: userId,
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//         skip,
//         take: limit,
//       });

//       /**
//        * Get total count
//        */
//       const total = await this.prismaService.notification.count({
//         where: {
//           recipientId: userId,
//         },
//       });

//       client.emit('notifications_history', {
//         notifications: notifications.map((notification) =>
//           this.mapNotificationToDto(notification),
//         ),
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       });

//       this.logger.log(`Sent notifications history to user ${userId}`);
//     } catch (error) {
//       this.logger.error(
//         `Error getting notifications: ${error instanceof Error ? error.message : String(error)}`,
//       );

//       client.emit('error', {
//         message: 'Failed to fetch notifications',
//       });
//     }
//   }

//
//   // EMIT NEW NOTIFICATION
//

//   async emitNewNotification(
//     userId: string,
//     notification: NotificationResponseDto,
//   ) {
//     const room = `user_${userId}`;

//     /**
//      * Send new notification
//      */
//     this.server.to(room).emit('new_notification', {
//       type: 'notification_created',
//       data: notification,
//       timestamp: new Date().toISOString(),
//     });

//     /**
//      * Update unread count
//      */
//     const unreadCount = await this.getUnreadCount(userId);

//     this.server.to(room).emit('unread_count', {
//       count: unreadCount,
//     });

//     this.logger.log(
//       `Emitted new notification to user ${userId}: ${notification.message}`,
//     );
//   }

//
//   // EMIT NOTIFICATION UPDATE
//

//   async emitNotificationUpdate(
//     userId: string,
//     notificationId: string,
//     type: 'read' | 'archived' | 'deleted',
//     notification?: NotificationResponseDto,
//   ) {
//     const room = `user_${userId}`;

//     this.server.to(room).emit('notification_updated', {
//       type: `notification_${type}`,

//       data: {
//         notificationId,
//         notification: notification || null,
//       },

//       timestamp: new Date().toISOString(),
//     });

//     /**
//      * Update unread count
//      * only when notification becomes read
//      */
//     if (type === 'read') {
//       const unreadCount = await this.getUnreadCount(userId);

//       this.server.to(room).emit('unread_count', {
//         count: unreadCount,
//       });
//     }

//     this.logger.log(
//       `Emitted ${type} update for notification ${notificationId} to user ${userId}`,
//     );
//   }

//
//   // EMIT BULK NOTIFICATION UPDATE
//

//   async emitBulkNotificationUpdate(
//     userId: string,
//     type: 'bulk_read' | 'bulk_archived' | 'bulk_deleted',
//     count: number,
//     notificationIds?: string[],
//   ) {
//     const room = `user_${userId}`;

//     this.server.to(room).emit('notifications_bulk_updated', {
//       type,

//       data: {
//         count,
//         notificationIds: notificationIds || [],
//       },

//       timestamp: new Date().toISOString(),
//     });

//     /**
//      * Update unread count for bulk read
//      */
//     if (type === 'bulk_read') {
//       const unreadCount = await this.getUnreadCount(userId);

//       this.server.to(room).emit('unread_count', {
//         count: unreadCount,
//       });
//     }

//     this.logger.log(
//       `Emitted ${type} update for ${count} notifications to user ${userId}`,
//     );
//   }

//
//   // CHECK IF USER IS CONNECTED
//

//   isUserConnected(userId: string): boolean {
//     return (
//       this.connectedUsers.has(userId) &&
//       this.connectedUsers.get(userId)!.size > 0
//     );
//   }

//
//   // GET CONNECTED USERS COUNT
//

//   getConnectedUsersCount(): number {
//     return this.connectedUsers.size;
//   }

//
//   // GET USER SOCKETS COUNT
//

//   getUserSocketsCount(userId: string): number {
//     return this.connectedUsers.get(userId)?.size || 0;
//   }

//
//   // GET UNREAD COUNT
//

//   private async getUnreadCount(userId: string): Promise<number> {
//     try {
//       return await this.prismaService.notification.count({
//         where: {
//           userId,
//           isRead: false,
//         },
//       });
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : String(error);

//       this.logger.error(
//         `Error getting unread count for ${userId}: ${errorMessage}`,
//       );

//       return 0;
//     }
//   }

//
//   // MAP NOTIFICATION TO DTO
//

//   private mapNotificationToDto(notification: any): NotificationResponseDto {
//     return {
//       ...notification,

//       id: notification.id,
//       recipientId: notification.recipientId,
//       type: notification.type,
//       message: notification.message,

//       relatedOrderId: notification.relatedOrderId || null,

//       relatedBatchId: notification.relatedBatchId || null,

//       isRead: notification.isRead,
//       createdAt: notification.createdAt,
//     };
//   }
// }

// _________________________________________________________________

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Server, Socket } from 'socket.io';

import { WsExceptionFilter } from './filters/ws-exception.filter';
import { wsValidationPipe } from './pipes/ws-validation.pipe';
import {
  SubscribeNotificationsDto,
  GetNotificationsDto,
} from './dto/ws-notification.dto';

interface NotificationSocket extends Socket {
  userId?: string;
}

interface NotificationResponseDto {
  id: string;
  recipientId?: string;
  type?: string;
  message?: string;
  relatedOrderId?: string | null;
  relatedBatchId?: string | null;
  isRead: boolean;
  createdAt: Date;
  [key: string]: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
@UseFilters(WsExceptionFilter)
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Set<string>>();

  constructor(private readonly prismaService: PrismaService) {}

  handleConnection(client: NotificationSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Connected clients: ${this.server.sockets.sockets.size}`);
  }

  handleDisconnect(client: NotificationSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId);

      if (userSockets) {
        userSockets.delete(client.id);

        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.userId);
        }
      }

      this.logger.log(`User ${client.userId} disconnected socket ${client.id}`);

      return;
    }

    for (const [userId, socketIds] of this.connectedUsers.entries()) {
      socketIds.delete(client.id);

      if (socketIds.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  @SubscribeMessage('subscribe_notifications')
  @UsePipes(wsValidationPipe)
  async handleSubscribeNotifications(
    @ConnectedSocket() client: NotificationSocket,
    @MessageBody() data: SubscribeNotificationsDto,
  ) {
    const { userId } = data;

    client.userId = userId;

    await client.join(`user_${userId}`);

    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }

    this.connectedUsers.get(userId)!.add(client.id);

    const unreadCount = await this.getUnreadCount(userId);

    client.emit('subscribed', {
      message: 'Subscribed to notifications',
      userId,
      unreadCount,
    });

    client.emit('unread_count', {
      count: unreadCount,
    });

    this.logger.log(
      `Socket ${client.id} subscribed to notifications for user ${userId}`,
    );
  }

  @SubscribeMessage('unsubscribe_notifications')
  async handleUnsubscribeNotifications(
    @ConnectedSocket() client: NotificationSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Socket is not subscribed to any user');
    }

    const userId = client.userId;

    await client.leave(`user_${userId}`);

    const userSockets = this.connectedUsers.get(userId);

    if (userSockets) {
      userSockets.delete(client.id);

      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }

    delete client.userId;

    client.emit('unsubscribed', {
      message: 'Unsubscribed from notifications',
    });

    this.logger.log(`Socket ${client.id} unsubscribed from user ${userId}`);
  }

  @SubscribeMessage('get_notifications')
  @UsePipes(wsValidationPipe)
  async handleGetNotifications(
    @ConnectedSocket() client: NotificationSocket,
    @MessageBody() data: GetNotificationsDto,
  ) {
    const { userId } = data;

    if (client.userId !== userId) {
      throw new WsException('Subscribe to this user first');
    }

    const page = Math.max(data.page || 1, 1);

    const limit = Math.min(Math.max(data.limit || 10, 1), 50);

    const skip = (page - 1) * limit;

    const notifications = await this.prismaService.notification.findMany({
      where: {
        recipientId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const total = await this.prismaService.notification.count({
      where: {
        recipientId: userId,
      },
    });

    client.emit('notifications_history', {
      notifications: notifications.map((notification) =>
        this.mapNotificationToDto(notification),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

    this.logger.log(`Sent notifications history to user ${userId}`);
  }

  async emitNewNotification(
    userId: string,
    notification: NotificationResponseDto,
  ) {
    const room = `user_${userId}`;

    this.server.to(room).emit('new_notification', {
      type: 'notification_created',
      data: notification,
      timestamp: new Date().toISOString(),
    });

    const unreadCount = await this.getUnreadCount(userId);

    this.server.to(room).emit('unread_count', {
      count: unreadCount,
    });

    this.logger.log(
      `Emitted new notification to user ${userId}: ${notification.message}`,
    );
  }

  async emitNotificationUpdate(
    userId: string,
    notificationId: string,
    type: 'read' | 'archived' | 'deleted',
    notification?: NotificationResponseDto,
  ) {
    const room = `user_${userId}`;

    this.server.to(room).emit('notification_updated', {
      type: `notification_${type}`,

      data: {
        notificationId,
        notification: notification || null,
      },

      timestamp: new Date().toISOString(),
    });

    if (type === 'read') {
      const unreadCount = await this.getUnreadCount(userId);

      this.server.to(room).emit('unread_count', {
        count: unreadCount,
      });
    }

    this.logger.log(
      `Emitted ${type} update for notification ${notificationId} to user ${userId}`,
    );
  }

  async emitBulkNotificationUpdate(
    userId: string,
    type: 'bulk_read' | 'bulk_archived' | 'bulk_deleted',
    count: number,
    notificationIds?: string[],
  ) {
    const room = `user_${userId}`;

    this.server.to(room).emit('notifications_bulk_updated', {
      type,

      data: {
        count,
        notificationIds: notificationIds || [],
      },

      timestamp: new Date().toISOString(),
    });

    if (type === 'bulk_read') {
      const unreadCount = await this.getUnreadCount(userId);

      this.server.to(room).emit('unread_count', {
        count: unreadCount,
      });
    }

    this.logger.log(
      `Emitted ${type} update for ${count} notifications to user ${userId}`,
    );
  }

  isUserConnected(userId: string): boolean {
    return (
      this.connectedUsers.has(userId) &&
      this.connectedUsers.get(userId)!.size > 0
    );
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  getUserSocketsCount(userId: string): number {
    return this.connectedUsers.get(userId)?.size || 0;
  }

  private async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.prismaService.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Error getting unread count for ${userId}: ${errorMessage}`,
      );

      return 0;
    }
  }

  private mapNotificationToDto(notification: any): NotificationResponseDto {
    return {
      ...notification,

      id: notification.id,
      recipientId: notification.recipientId,
      type: notification.type,
      message: notification.message,

      relatedOrderId: notification.relatedOrderId || null,

      relatedBatchId: notification.relatedBatchId || null,

      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
