import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';
import { CustomerRepository } from '../interfaces/customer.repository.interface';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    return this.prismaService.customer.create({
      data: {
        name: createCustomerDto.name,
        phone: createCustomerDto.phone,
      },
    });
  }

  async findAll() {
    return this.prismaService.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.customer.findUnique({
      where: {
        id,
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prismaService.customer.findUnique({
      where: {
        phone,
      },
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return this.prismaService.customer.update({
      where: {
        id,
      },
      data: updateCustomerDto,
    });
  }

  async delete(id: string) {
    await this.prismaService.customer.delete({
      where: {
        id,
      },
    });
  }
}
