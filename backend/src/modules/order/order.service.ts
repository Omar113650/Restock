import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/order.dto';
import type { OrderRepository } from './interfaces/order.repository.interface';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepository: OrderRepository,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const { reservationId } = createOrderDto;

    const existingOrder =
      await this.orderRepository.findByReservationId(reservationId);
    if (existingOrder) {
      throw new ConflictException(
        'An order already exists for this reservation',
      );
    }

    return this.orderRepository.create(createOrderDto);
  }

  async findAll() {
    return this.orderRepository.findAll();
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByReservationId(reservationId: string) {
    const order = await this.orderRepository.findByReservationId(reservationId);
    if (!order) {
      throw new NotFoundException('Order not found for this reservation');
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.orderRepository.updateStatus(id, status);
  }
}
