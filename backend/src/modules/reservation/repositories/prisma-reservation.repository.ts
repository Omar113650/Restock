import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateReservationDto, UpdateReservationDto } from '../dto/reservation.dto';
import { ReservationRepository } from '../interfaces/reservation.repository.interface';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class PrismaReservationRepository implements ReservationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateReservationDto & { expiresAt: Date }) {
    return this.prismaService.reservation.create({
      data: {
        rescueOfferId: data.rescueOfferId,
        customerId: data.customerId,
        quantity: data.quantity,
        expiresAt: data.expiresAt,
        status: ReservationStatus.RESERVED,
      },
      include: {
        rescueOffer: {
          include: {
            batch: {
              include: {
                product: true,
              },
            },
          },
        },
        customer: true,
      },
    });
  }

  async findAll() {
    return this.prismaService.reservation.findMany({
      include: {
        rescueOffer: {
          include: {
            batch: {
              include: {
                product: true,
              },
            },
          },
        },
        customer: true,
      },
      orderBy: {
        reservedAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.reservation.findUnique({
      where: {
        id,
      },
      include: {
        rescueOffer: {
          include: {
            batch: {
              include: {
                product: true,
              },
            },
          },
        },
        customer: true,
      },
    });
  }

  async findActiveByCustomer(customerId: string) {
    return this.prismaService.reservation.findMany({
      where: {
        customerId,
        status: ReservationStatus.RESERVED,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        rescueOffer: true,
      },
    });
  }

  async findExpiredReservations(now: Date) {
    return this.prismaService.reservation.findMany({
      where: {
        status: ReservationStatus.RESERVED,
        expiresAt: {
          lte: now,
        },
      },
    });
  }

  async update(id: string, data: UpdateReservationDto & { status?: ReservationStatus }) {
    return this.prismaService.reservation.update({
      where: {
        id,
      },
      data: {
        ...(data.rescueOfferId && { rescueOfferId: data.rescueOfferId }),
        ...(data.customerId && { customerId: data.customerId }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.status && { status: data.status }),
      },
      include: {
        rescueOffer: true,
        customer: true,
      },
    });
  }

  async delete(id: string) {
    await this.prismaService.reservation.delete({
      where: {
        id,
      },
    });
  }
}
