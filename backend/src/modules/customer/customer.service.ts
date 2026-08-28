import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from '../../core/redis/redis.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import type { CustomerRepository } from './interfaces/customer.repository.interface';

@Injectable()
export class CustomerService {
  private readonly CUSTOMERS_CACHE_KEY = 'customers:all';
  private readonly CACHE_TTL = 60;

  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    private readonly redisService: RedisService,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const { phone } = createCustomerDto;

    const existingCustomer = await this.customerRepository.findByPhone(phone);

    if (existingCustomer) {
      throw new ConflictException('Customer with this phone number already exists');
    }

    const customer = await this.customerRepository.create(createCustomerDto);

    await this.redisService.del(this.CUSTOMERS_CACHE_KEY);

    return customer;
  }

  async findAll() {
    const cachedCustomers = await this.redisService.get(this.CUSTOMERS_CACHE_KEY);

    if (cachedCustomers) {
      console.log('CACHE HIT');
      return JSON.parse(String(cachedCustomers));
    }

    console.log('CACHE MISS');
    const customers = await this.customerRepository.findAll();

    await this.redisService.set(
      this.CUSTOMERS_CACHE_KEY,
      JSON.stringify(customers),
      this.CACHE_TTL,
    );

    return customers;
  }

  async findOne(id: string) {
    const cacheKey = `customer:${id}`;
    const cachedCustomer = await this.redisService.get(cacheKey);

    if (cachedCustomer) {
      console.log('CACHE HIT');
      return JSON.parse(String(cachedCustomer));
    }

    console.log('CACHE MISS');
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.redisService.set(
      cacheKey,
      JSON.stringify(customer),
      this.CACHE_TTL,
    );

    return customer;
  }

  async findByPhone(phone: string) {
    const customer = await this.customerRepository.findByPhone(phone);
    if (!customer) {
      throw new NotFoundException('Customer not found with this phone number');
    }
    return customer;
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto) {
    const existingCustomer = await this.customerRepository.findById(id);

    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if new phone is taken by another customer
    if (updateCustomerDto.phone && updateCustomerDto.phone !== existingCustomer.phone) {
      const otherCustomer = await this.customerRepository.findByPhone(updateCustomerDto.phone);
      if (otherCustomer) {
        throw new ConflictException('Phone number is already in use by another customer');
      }
    }

    const customer = await this.customerRepository.update(id, updateCustomerDto);

    await this.redisService.del(this.CUSTOMERS_CACHE_KEY);
    await this.redisService.del(`customer:${id}`);

    return customer;
  }

  async deleteCustomer(id: string) {
    const existingCustomer = await this.customerRepository.findById(id);

    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.delete(id);

    await this.redisService.del(this.CUSTOMERS_CACHE_KEY);
    await this.redisService.del(`customer:${id}`);

    return {
      message: 'Customer deleted successfully',
    };
  }
}
