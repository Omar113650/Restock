import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from '../../core/redis/redis.service';
import { BatchService } from '../batch/batch.service';
import { CreateRescueOfferDto, UpdateRescueOfferDto } from './dto/rescue-offer.dto';
import type { RescueOfferRepository } from './interfaces/rescue-offer.repository.interface';

@Injectable()
export class RescueOfferService {
  private readonly OFFERS_CACHE_KEY = 'rescue-offers:all';
  private readonly ACTIVE_OFFERS_CACHE_KEY = 'rescue-offers:active';
  private readonly CACHE_TTL = 60;

  constructor(
    @Inject('RescueOfferRepository')
    private readonly rescueOfferRepository: RescueOfferRepository,
    private readonly batchService: BatchService,
    private readonly redisService: RedisService,
  ) {}

  async createRescueOffer(createRescueOfferDto: CreateRescueOfferDto) {
    // Validate batch existence
    await this.batchService.findOne(createRescueOfferDto.batchId);

    const offer = await this.rescueOfferRepository.create(createRescueOfferDto);

    await this.clearCache();

    return offer;
  }

  async findAll() {
    const cachedOffers = await this.redisService.get(this.OFFERS_CACHE_KEY);

    if (cachedOffers) {
      console.log('CACHE HIT');
      return JSON.parse(String(cachedOffers));
    }

    console.log('CACHE MISS');
    const offers = await this.rescueOfferRepository.findAll();

    await this.redisService.set(
      this.OFFERS_CACHE_KEY,
      JSON.stringify(offers),
      this.CACHE_TTL,
    );

    return offers;
  }

  async findActiveOffers() {
    const cachedActiveOffers = await this.redisService.get(this.ACTIVE_OFFERS_CACHE_KEY);

    if (cachedActiveOffers) {
      console.log('CACHE HIT');
      return JSON.parse(String(cachedActiveOffers));
    }

    console.log('CACHE MISS');
    const offers = await this.rescueOfferRepository.findActiveOffers();

    await this.redisService.set(
      this.ACTIVE_OFFERS_CACHE_KEY,
      JSON.stringify(offers),
      this.CACHE_TTL,
    );

    return offers;
  }

  async findOne(id: string) {
    const cacheKey = `rescue-offer:${id}`;
    const cachedOffer = await this.redisService.get(cacheKey);

    if (cachedOffer) {
      console.log('CACHE HIT');
      return JSON.parse(String(cachedOffer));
    }

    console.log('CACHE MISS');
    const offer = await this.rescueOfferRepository.findById(id);

    if (!offer) {
      throw new NotFoundException('Rescue offer not found');
    }

    await this.redisService.set(
      cacheKey,
      JSON.stringify(offer),
      this.CACHE_TTL,
    );

    return offer;
  }

  async updateRescueOffer(id: string, updateRescueOfferDto: UpdateRescueOfferDto) {
    const existingOffer = await this.rescueOfferRepository.findById(id);
    if (!existingOffer) {
      throw new NotFoundException('Rescue offer not found');
    }

    if (updateRescueOfferDto.batchId) {
      await this.batchService.findOne(updateRescueOfferDto.batchId);
    }

    const offer = await this.rescueOfferRepository.update(id, updateRescueOfferDto);

    await this.clearCache();
    await this.redisService.del(`rescue-offer:${id}`);

    return offer;
  }

  async deleteRescueOffer(id: string) {
    const existingOffer = await this.rescueOfferRepository.findById(id);
    if (!existingOffer) {
      throw new NotFoundException('Rescue offer not found');
    }

    await this.rescueOfferRepository.delete(id);

    await this.clearCache();
    await this.redisService.del(`rescue-offer:${id}`);

    return {
      message: 'Rescue offer deleted successfully',
    };
  }

  private async clearCache() {
    await this.redisService.del(this.OFFERS_CACHE_KEY);
    await this.redisService.del(this.ACTIVE_OFFERS_CACHE_KEY);
  }
}
