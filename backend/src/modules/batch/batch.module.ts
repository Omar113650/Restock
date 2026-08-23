import { Module } from '@nestjs/common';

import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';

import { PrismaModule } from '../../core/prisma/prisma.module';
import { RedisModule } from '../../core/redis/redis.module';

import { PrismaBatchRepository } from './repository/prisma-batch.repository';

@Module({
  imports: [PrismaModule, RedisModule],

  controllers: [BatchController],

  providers: [
    BatchService,

    {
      provide: 'BatchRepository',
      useClass: PrismaBatchRepository,
    },
  ],

  exports: [BatchService],
})
export class BatchModule {}