// import {
//   Inject,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';

// import { CustomerService } from '../customer/customer.service';

// import { CreateNotificationDto } from './dto/notification.dto';

// import type { NotificationRepository } from './interfaces/notification.repository.interface';

// @Injectable()
// export class NotificationService {
//   constructor(
//     @Inject('NotificationRepository')
//     private readonly notificationRepository: NotificationRepository,

//     private readonly customerService: CustomerService,
//   ) {}

//   // ============================================================
//   // CREATE NOTIFICATION
//   // ============================================================

//   async createNotification(
//     createNotificationDto: CreateNotificationDto,
//   ) {
//     /**
//      * Make sure the recipient/customer exists
//      */
//     await this.customerService.findOne(
//       createNotificationDto.recipientId,
//     );

//     /**
//      * Create notification
//      */
//     return this.notificationRepository.create(
//       createNotificationDto,
//     );
//   }

//   // ============================================================
//   // FIND ALL
//   // ============================================================

//   async findAll() {
//     return this.notificationRepository.findAll();
//   }

//   // ============================================================
//   // FIND ONE
//   // ============================================================

//   async findOne(id: string) {
//     const notification =
//       await this.notificationRepository.findById(id);

//     if (!notification) {
//       throw new NotFoundException(
//         'Notification not found',
//       );
//     }

//     return notification;
//   }

//   // ============================================================
//   // FIND BY RECIPIENT
//   // ============================================================

//   async findByRecipient(
//     recipientId: string,
//     isRead?: boolean,
//   ) {
//     /**
//      * Make sure customer exists
//      */
//     await this.customerService.findOne(recipientId);

//     return this.notificationRepository.findByRecipient(
//       recipientId,
//       isRead,
//     );
//   }

//   // ============================================================
//   // MARK ONE AS READ
//   // ============================================================

//   async markAsRead(id: string) {
//     const notification =
//       await this.notificationRepository.findById(id);

//     if (!notification) {
//       throw new NotFoundException(
//         'Notification not found',
//       );
//     }

//     return this.notificationRepository.markAsRead(id);
//   }

//   // ============================================================
//   // MARK ALL AS READ
//   // ============================================================

//   async markAllAsRead(recipientId: string) {
//     /**
//      * Make sure customer exists
//      */
//     await this.customerService.findOne(recipientId);

//     await this.notificationRepository.markAllAsRead(
//       recipientId,
//     );

//     return {
//       message: 'All notifications marked as read',
//     };
//   }
// }



// ___________________________________________________________________________________

import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { CustomerService } from '../customer/customer.service';

import { CreateNotificationDto } from './dto/notification.dto';
import { NotificationGateway } from './notification.gateway';

import type { NotificationRepository } from './interfaces/notification.repository.interface';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: NotificationRepository,

    private readonly customerService: CustomerService,

    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    await this.customerService.findOne(createNotificationDto.recipientId);

    const notification = await this.notificationRepository.create(
      createNotificationDto,
    );

    await this.notificationGateway.emitNewNotification(
      createNotificationDto.recipientId,
      notification,
    );

    return notification;
  }

  async findAll() {
    return this.notificationRepository.findAll();
  }

  async findOne(id: string) {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async findByRecipient(recipientId: string, isRead?: boolean) {
    await this.customerService.findOne(recipientId);

    return this.notificationRepository.findByRecipient(recipientId, isRead);
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.notificationRepository.markAsRead(id);

    await this.notificationGateway.emitNotificationUpdate(
      notification.recipientId,
      id,
      'read',
      updated,
    );

    return updated;
  }

  async markAllAsRead(recipientId: string) {
    await this.customerService.findOne(recipientId);

    const result = await this.notificationRepository.markAllAsRead(recipientId);

    await this.notificationGateway.emitBulkNotificationUpdate(
      recipientId,
      'bulk_read',
      (result as { count?: number } | null | undefined)?.count ?? 0,
    );

    return {
      message: 'All notifications marked as read',
    };
  }
}
