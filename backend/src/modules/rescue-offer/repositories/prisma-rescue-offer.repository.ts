import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateRescueOfferDto, UpdateRescueOfferDto } from '../dto/rescue-offer.dto';
import { RescueOfferRepository } from '../interfaces/rescue-offer.repository.interface';

@Injectable()
export class PrismaRescueOfferRepository implements RescueOfferRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRescueOfferDto: CreateRescueOfferDto) {
    return this.prismaService.rescueOffer.create({
      data: {
        batchId: createRescueOfferDto.batchId,
        originalPrice: createRescueOfferDto.originalPrice,
        discountPrice: createRescueOfferDto.discountPrice,
        quantityAvailable: createRescueOfferDto.quantityAvailable,
      },
    });
  }

  async findAll() {
    return this.prismaService.rescueOffer.findMany({
      include: {
        batch: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.rescueOffer.findUnique({
      where: {
        id,
      },
      include: {
        batch: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findActiveOffers() {
    return this.prismaService.rescueOffer.findMany({
      where: {
        status: 'ACTIVE',
        quantityAvailable: {
          gt: 0,
        },
      },
      include: {
        batch: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByBatchId(batchId: string) {
    return this.prismaService.rescueOffer.findMany({
      where: {
        batchId,
      },
    });
  }

  async update(id: string, updateRescueOfferDto: UpdateRescueOfferDto) {
    return this.prismaService.rescueOffer.update({
      where: {
        id,
      },
      data: updateRescueOfferDto,
    });
  }

  async delete(id: string) {
    await this.prismaService.rescueOffer.delete({
      where: {
        id,
      },
    });
  }
}
