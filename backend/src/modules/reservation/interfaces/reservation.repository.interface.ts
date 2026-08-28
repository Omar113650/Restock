import { CreateReservationDto, UpdateReservationDto } from '../dto/reservation.dto';

export interface ReservationRepository {
  create(data: CreateReservationDto & { expiresAt: Date }): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findActiveByCustomer(customerId: string): Promise<any[]>;
  findExpiredReservations(now: Date): Promise<any[]>;
  update(id: string, data: UpdateReservationDto & { status?: any }): Promise<any>;
  delete(id: string): Promise<void>;
}
