import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateNotificationDto } from '../dto/notification.dto';
import { NotificationRepository } from '../interfaces/notification.repository.interface';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.prismaService.notification.create({
      data: {
        recipientId: createNotificationDto.recipientId,
        type: createNotificationDto.type,
        message: createNotificationDto.message,
        relatedOrderId: createNotificationDto.relatedOrderId,
        relatedBatchId: createNotificationDto.relatedBatchId,
      },
    });
  }

  async findAll() {
    return this.prismaService.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.notification.findUnique({
      where: {
        id,
      },
    });
  }

  async findByRecipient(recipientId: string, isRead?: boolean) {
    return this.prismaService.notification.findMany({
      where: {
        recipientId,
        ...(isRead !== undefined && { isRead }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(id: string) {
    return this.prismaService.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(recipientId: string) {
    await this.prismaService.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
