import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from '../../core/redis/redis.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import type { ProductRepository } from './interfaces/product.repository.interface';

@Injectable()
export class ProductService {
  private readonly PRODUCTS_CACHE_KEY = 'products:all';
  private readonly CACHE_TTL = 60;

  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    private readonly redisService: RedisService,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    const { name } = createProductDto;

    const existingProduct = await this.productRepository.findByName(name);

    if (existingProduct) {
      throw new ConflictException('Product already exists');
    }

    const product = await this.productRepository.create(createProductDto);

    await this.redisService.del(this.PRODUCTS_CACHE_KEY);

    return product;
  }

  async findAll() {
    const cachedProducts = await this.redisService.get(this.PRODUCTS_CACHE_KEY);

    if (cachedProducts) {
      console.log('CACHE HIT');

      return JSON.parse(String(cachedProducts));
    }

    console.log('CACHE MISS');

    const products = await this.productRepository.findAll();

    await this.redisService.set(
      this.PRODUCTS_CACHE_KEY,
      JSON.stringify(products),
      this.CACHE_TTL,
    );

    return products;
  }

  async findOne(id: string) {
    const cacheKey = `product:${id}`;

    const cachedProduct = await this.redisService.get(cacheKey);

    if (cachedProduct) {
      console.log('CACHE HIT');

      return JSON.parse(String(cachedProduct));
    }

    console.log('CACHE MISS');

    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.redisService.set(
      cacheKey,
      JSON.stringify(product),
      this.CACHE_TTL,
    );

    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.productRepository.update(id, updateProductDto);

    await this.redisService.del(this.PRODUCTS_CACHE_KEY);
    await this.redisService.del(`product:${id}`);

    return product;
  }

  async deleteProduct(id: string) {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.delete(id);

    await this.redisService.del(this.PRODUCTS_CACHE_KEY);
    await this.redisService.del(`product:${id}`);

    return {
      message: 'Product deleted successfully',
    };
  }
}
