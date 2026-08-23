import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { CustomerModule } from '../customer/customer.module';
import { PrismaNotificationRepository } from './repositories/prisma-notification.repository';

@Module({
  imports: [PrismaModule, CustomerModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: 'NotificationRepository',
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
