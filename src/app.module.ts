import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ProductModule } from './modules/product/product.module';
// import { NotificationModule } from './modules/notification/notification.module';
// import { PaymentService } from './modules/payment/payment.service';
// import { PaymentModule } from './modules/payment/payment.module';
// import { OrderModule } from './modules/order/order.module';
// import { ReservationModule } from './modules/reservation/reservation.module';
// import { CustomerModule } from './modules/customer/customer.module';
// import { RescueOfferModule } from './modules/rescue-offer/rescue-offer.module';
// import { RescueOfferModule } from './modules/rescue-offer/rescue-offer.module';
// import { BatchModule } from './modules/batch/batch.module';
// import { ProductModule } from './product/product.module';
// import { ProductModule } from './modules/product/product.module';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
