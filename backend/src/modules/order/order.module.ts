import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { PrismaOrderRepository } from './repositories/prisma-order.repository';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: 'OrderRepository',
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [OrderService],
})
export class OrderModule {}
