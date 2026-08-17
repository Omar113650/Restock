import { Test, TestingModule } from '@nestjs/testing';
import { RescueOfferService } from './rescue-offer.service';

describe('RescueOfferService', () => {
  let service: RescueOfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RescueOfferService],
    }).compile();

    service = module.get<RescueOfferService>(RescueOfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
