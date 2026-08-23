import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateOrderDto } from '../dto/order.dto';
import { OrderRepository } from '../interfaces/order.repository.interface';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    return this.prismaService.order.create({
      data: {
        reservationId: createOrderDto.reservationId,
        totalAmount: createOrderDto.totalAmount,
        status: OrderStatus.PAID,
      },
      include: {
        reservation: {
          include: {
            customer: true,
            rescueOffer: {
              include: {
                batch: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prismaService.order.findMany({
      include: {
        reservation: {
          include: {
            customer: true,
            rescueOffer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prismaService.order.findUnique({
      where: {
        id,
      },
      include: {
        reservation: {
          include: {
            customer: true,
            rescueOffer: true,
          },
        },
      },
    });
  }

  async findByReservationId(reservationId: string) {
    return this.prismaService.order.findUnique({
      where: {
        reservationId,
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return this.prismaService.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}
