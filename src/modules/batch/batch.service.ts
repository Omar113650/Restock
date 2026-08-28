import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RedisService } from '../../core/redis/redis.service';

import {
  CreateBatchDto,
  UpdateBatchDto,
} from './dto/batch.dto';

import type { BatchRepository } from './interface/batch.repository.interface';

@Injectable()
export class BatchService {
  private readonly BATCHES_CACHE_KEY = 'batches:all';
  private readonly CACHE_TTL = 60;

  constructor(
    @Inject('BatchRepository')
    private readonly batchRepository: BatchRepository,
    private readonly redisService: RedisService,
  ) {}

  async createBatch(createBatchDto: CreateBatchDto) {
    const batch = await this.batchRepository.create(createBatchDto);

    await this.redisService.del(this.BATCHES_CACHE_KEY);

    return batch;
  }

  async findAll() {
    const cachedBatches = await this.redisService.get(
      this.BATCHES_CACHE_KEY,
    );

    if (cachedBatches) {
      console.log('CACHE HIT');

      return JSON.parse(String(cachedBatches));
    }

    console.log('CACHE MISS');

    const batches = await this.batchRepository.findAll();

    await this.redisService.set(
      this.BATCHES_CACHE_KEY,
      JSON.stringify(batches),
      this.CACHE_TTL,
    );

    return batches;
  }

  async findOne(id: string) {
    const cacheKey = `batch:${id}`;

    const cachedBatch = await this.redisService.get(cacheKey);

    if (cachedBatch) {
      console.log('CACHE HIT');

      return JSON.parse(String(cachedBatch));
    }

    console.log('CACHE MISS');

    const batch = await this.batchRepository.findById(id);

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    await this.redisService.set(
      cacheKey,
      JSON.stringify(batch),
      this.CACHE_TTL,
    );

    return batch;
  }

  async updateBatch(
    id: string,
    updateBatchDto: UpdateBatchDto,
  ) {
    const existingBatch =
      await this.batchRepository.findById(id);

    if (!existingBatch) {
      throw new NotFoundException('Batch not found');
    }

    const batch = await this.batchRepository.update(
      id,
      updateBatchDto,
    );

    await this.redisService.del(this.BATCHES_CACHE_KEY);
    await this.redisService.del(`batch:${id}`);

    return batch;
  }

  async deleteBatch(id: string) {
    const existingBatch =
      await this.batchRepository.findById(id);

    if (!existingBatch) {
      throw new NotFoundException('Batch not found');
    }

    await this.batchRepository.delete(id);

    await this.redisService.del(this.BATCHES_CACHE_KEY);
    await this.redisService.del(`batch:${id}`);

    return {
      message: 'Batch deleted successfully',
    };
  }
}