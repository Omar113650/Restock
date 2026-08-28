import { CreateOrderDto } from '../dto/order.dto';

export interface OrderRepository {
  create(data: CreateOrderDto): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findByReservationId(reservationId: string): Promise<any | null>;
  updateStatus(id: string, status: any): Promise<any>;
}
