import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { ProductModule } from './modules/product/product.module';
import { BatchModule } from './modules/batch/batch.module';
import { CustomerModule } from './modules/customer/customer.module';
import { RescueOfferModule } from './modules/rescue-offer/rescue-offer.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { OrderModule } from './modules/order/order.module';
import { NotificationModule } from './modules/notification/notification.module';
// import { PaymentModule } from './modules/payment/payment.module';
import { createObserveModule } from '@nestjs/observe';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeAppKey = process.env.OBSERVE_APP_KEY ?? '';
const observeAppSecret = process.env.OBSERVE_APP_SECRET ?? '';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    ProductModule,
    BatchModule,
    CustomerModule,
    RescueOfferModule,
    ReservationModule,
    OrderModule,
    NotificationModule,
    // PaymentModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ObserveModule.forRoot({
      appKey: observeAppKey,
      appSecret: observeAppSecret,
      serviceId: 'cats-app',
      runtimeMetrics: true,
      runtimeMetricsInterval: 60000,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
