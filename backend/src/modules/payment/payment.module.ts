import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { ReservationModule } from '../reservation/reservation.module';
import { OrderModule } from '../order/order.module';
import { NotificationModule } from '../notification/notification.module';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [
    ConfigModule,
    ReservationModule,
    OrderModule,
    NotificationModule,
    CustomerModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
