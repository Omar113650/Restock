import { Module } from '@nestjs/common';
import { RescueOfferController } from './rescue-offer.controller';
import { RescueOfferService } from './rescue-offer.service';

@Module({
  controllers: [RescueOfferController],
  providers: [RescueOfferService]
})
export class RescueOfferModule {}
