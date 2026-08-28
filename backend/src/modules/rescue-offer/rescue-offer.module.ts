import { Module } from '@nestjs/common';
import { RescueOfferController } from './rescue-offer.controller';
import { RescueOfferService } from './rescue-offer.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { RedisModule } from '../../core/redis/redis.module';
import { BatchModule } from '../batch/batch.module';
import { PrismaRescueOfferRepository } from './repositories/prisma-rescue-offer.repository';

@Module({
  imports: [PrismaModule, RedisModule, BatchModule],
  controllers: [RescueOfferController],
  providers: [
    RescueOfferService,
    {
      provide: 'RescueOfferRepository',
      useClass: PrismaRescueOfferRepository,
    },
  ],
  exports: [RescueOfferService],
})
export class RescueOfferModule {}
