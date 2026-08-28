import { CreateRescueOfferDto, UpdateRescueOfferDto } from '../dto/rescue-offer.dto';

export interface RescueOfferRepository {
  create(data: CreateRescueOfferDto): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findActiveOffers(): Promise<any[]>;
  findByBatchId(batchId: string): Promise<any[]>;
  update(id: string, data: UpdateRescueOfferDto): Promise<any>;
  delete(id: string): Promise<void>;
}
