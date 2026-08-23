import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';

export interface CustomerRepository {
  create(data: CreateCustomerDto): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findByPhone(phone: string): Promise<any | null>;
  update(id: string, data: UpdateCustomerDto): Promise<any>;
  delete(id: string): Promise<void>;
}
