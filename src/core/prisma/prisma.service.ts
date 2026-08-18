import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error(' Failed to connect to MongoDB');
      console.error(error);

      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();

    console.log('🔌 Database disconnected');
  }
}
