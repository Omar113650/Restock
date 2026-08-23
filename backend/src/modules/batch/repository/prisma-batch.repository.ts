import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateBatchDto, UpdateBatchDto } from '../dto/batch.dto';
import { BatchRepository } from '../interface/batch.repository.interface';

@Injectable()
export class PrismaBatchRepository implements BatchRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findById(id: string): Promise<any | null> {
    return this.prismaService.batch.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async create(createBatchDto: CreateBatchDto) {
    return this.prismaService.batch.create({
      data: {
        productId: createBatchDto.productId,
        quantity: createBatchDto.quantity,
        expiryDate: new Date(createBatchDto.expiryDate),
        riskLevel: createBatchDto.riskLevel,
      },
    });
  }

  async findAll() {
    return this.prismaService.batch.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with id ${id} not found`);
    }

    return batch;
  }

  async update(id: string, updateBatchDto: UpdateBatchDto) {
    await this.findOne(id);

    return this.prismaService.batch.update({
      where: {
        id,
      },
      data: {
        ...(updateBatchDto.productId && {
          productId: updateBatchDto.productId,
        }),

        ...(updateBatchDto.quantity !== undefined && {
          quantity: updateBatchDto.quantity,
        }),

        ...(updateBatchDto.expiryDate && {
          expiryDate: new Date(updateBatchDto.expiryDate),
        }),

        ...(updateBatchDto.riskLevel && {
          riskLevel: updateBatchDto.riskLevel,
        }),
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.prismaService.batch.delete({
      where: {
        id,
      },
    });
  }
}
