import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { RedisModule } from '../../core/redis/redis.module';
import { PrismaCustomerRepository } from './repositories/prisma-customer.repository';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    {
      provide: 'CustomerRepository',
      useClass: PrismaCustomerRepository,
    },
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
