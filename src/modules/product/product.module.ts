import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { RedisModule } from '../../core/redis/redis.module';
import { PrismaProductRepository } from './repositories/prisma-product.repository';

@Module({
  imports: [PrismaModule, RedisModule],

  controllers: [ProductController],

  providers: [
    ProductService,

    {
      provide: 'ProductRepository',
      useClass: PrismaProductRepository,
    },
  ],

  exports: [ProductService],
})
export class ProductModule {}
