import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { RedisModule } from '../../core/redis/redis.module';
import { CustomerModule } from '../customer/customer.module';
import { RescueOfferModule } from '../rescue-offer/rescue-offer.module';
import { NotificationModule } from '../notification/notification.module';
import { PrismaReservationRepository } from './repositories/prisma-reservation.repository';
import { ReservationExpiryScheduler } from './scheduler/reservation-expiry.scheduler';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    CustomerModule,
    RescueOfferModule,
    NotificationModule,
  ],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    ReservationExpiryScheduler,
    {
      provide: 'ReservationRepository',
      useClass: PrismaReservationRepository,
    },
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
