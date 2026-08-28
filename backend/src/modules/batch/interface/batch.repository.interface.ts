import {
  CreateBatchDto,
  UpdateBatchDto,
} from '../dto/batch.dto';

export interface BatchRepository {
  create(data: CreateBatchDto): Promise<any>;

  findAll(): Promise<any[]>;

  findById(id: string): Promise<any | null>;

  update(id: string, data: UpdateBatchDto): Promise<any>;

  delete(id: string): Promise<void>;
}