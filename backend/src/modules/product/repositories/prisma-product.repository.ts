import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { ProductRepository } from '../interfaces/product.repository.interface';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prismaService.product.create({
      data: {
        name: createProductDto.name,
        unit: createProductDto.unit,
      },
    });
  }

  async findAll() {
    return this.prismaService.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.product.findUnique({
      where: {
        id,
      },
    });
  }

  async findByName(name: string) {
    return this.prismaService.product.findFirst({
      where: {
        name,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return this.prismaService.product.update({
      where: {
        id,
      },
      data: updateProductDto,
    });
  }

  async delete(id: string) {
    await this.prismaService.product.delete({
      where: {
        id,
      },
    });
  }
}
