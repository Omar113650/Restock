import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

export interface ProductRepository {
  create(data: CreateProductDto): Promise<any>;

  findAll(): Promise<any[]>;

  findById(id: string): Promise<any | null>;

  findByName(name: string): Promise<any | null>;

  update(
    id: string,
    data: UpdateProductDto,
  ): Promise<any>;

  delete(id: string): Promise<void>;
}