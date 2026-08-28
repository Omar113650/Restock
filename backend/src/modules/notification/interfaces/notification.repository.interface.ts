import { CreateNotificationDto } from '../dto/notification.dto';

export interface NotificationRepository {
  create(data: CreateNotificationDto): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findByRecipient(recipientId: string, isRead?: boolean): Promise<any[]>;
  markAsRead(id: string): Promise<any>;
  markAllAsRead(recipientId: string): Promise<void>;
}
