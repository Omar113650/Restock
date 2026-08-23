import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomerService } from '../customer/customer.service';
import { CreateNotificationDto } from './dto/notification.dto';
import type { NotificationRepository } from './interfaces/notification.repository.interface';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: NotificationRepository,
    private readonly customerService: CustomerService,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    // Validate customer exists
    await this.customerService.findOne(createNotificationDto.recipientId);

    return this.notificationRepository.create(createNotificationDto);
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
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(recipientId: string) {
    await this.customerService.findOne(recipientId);
    await this.notificationRepository.markAllAsRead(recipientId);
    return { message: 'All notifications marked as read' };
  }
}
