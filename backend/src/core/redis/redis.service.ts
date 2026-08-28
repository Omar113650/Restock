import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    });
  }
  async onModuleInit() {
    await this.redis.ping();
    console.log('Redis connected successfully');
  }
  async onModuleDestroy() {
    await this.redis.quit();
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);

    if (ttl) {
      await this.redis.set(key, data, 'EX', ttl);
      return;
    }
    await this.redis.set(key, data);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }
    return JSON.parse(data) as T;
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);

    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  // Rate Limit
  async increment(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttl: number,
  ): Promise<boolean> {
    const result = await this.redis.set(key, value, 'EX', ttl, 'NX');

    return result === 'OK';
  }
}
