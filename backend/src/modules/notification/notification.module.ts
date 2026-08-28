import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';

import { PrismaModule } from '../../core/prisma/prisma.module';

import { CustomerModule } from '../customer/customer.module';

import { PrismaNotificationRepository } from './repositories/prisma-notification.repository';

@Module({
  imports: [PrismaModule, CustomerModule, ScheduleModule.forRoot()],

  controllers: [NotificationController],

  providers: [
    NotificationService,

    NotificationGateway,

    {
      provide: 'NotificationRepository',
      useClass: PrismaNotificationRepository,
    },
  ],

  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
