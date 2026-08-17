import { Test, TestingModule } from '@nestjs/testing';
import { RescueOfferController } from './rescue-offer.controller';

describe('RescueOfferController', () => {
  let controller: RescueOfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RescueOfferController],
    }).compile();

    controller = module.get<RescueOfferController>(RescueOfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
