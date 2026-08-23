import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from '../../core/redis/redis.service';
import { CustomerService } from '../customer/customer.service';
import { RescueOfferService } from '../rescue-offer/rescue-offer.service';
import { NotificationService } from '../notification/notification.service';
import { CreateReservationDto } from './dto/reservation.dto';
import type { ReservationRepository } from './interfaces/reservation.repository.interface';
import {
  ReservationStatus,
  OfferStatus,
  NotificationType,
} from '@prisma/client';

@Injectable()
export class ReservationService {
  private readonly RESERVATIONS_CACHE_KEY = 'reservations:all';
  private readonly CACHE_TTL = 60;

  constructor(
    @Inject('ReservationRepository')
    private readonly reservationRepository: ReservationRepository,
    private readonly rescueOfferService: RescueOfferService,
    private readonly customerService: CustomerService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
  ) {}

  async createReservation(createReservationDto: CreateReservationDto) {
    const { rescueOfferId, customerId, quantity } = createReservationDto;

    await this.customerService.findOne(customerId);

    const offer = await this.rescueOfferService.findOne(rescueOfferId);

    if (offer.status !== OfferStatus.ACTIVE) {
      throw new BadRequestException('Rescue offer is not active');
    }

    if (offer.quantityAvailable < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Only ${offer.quantityAvailable} units available`,
      );
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const reservation = await this.reservationRepository.create({
      rescueOfferId,
      customerId,
      quantity,
      expiresAt,
    });

    const newQty = offer.quantityAvailable - quantity;
    await this.rescueOfferService.updateRescueOffer(rescueOfferId, {
      quantityAvailable: newQty,
      ...(newQty === 0 && { status: OfferStatus.SOLD_OUT }),
    });

    // Trigger Notification
    await this.notificationService.createNotification({
      recipientId: customerId,
      type: NotificationType.RESERVATION_CONFIRMED,
      message: `Your reservation for ${quantity}x ${offer.batch.product.name} is confirmed! Please complete payment within 15 minutes.`,
    });

    await this.redisService.del(this.RESERVATIONS_CACHE_KEY);

    return reservation;
  }

  async findAll() {
    const cachedReservations = await this.redisService.get(
      this.RESERVATIONS_CACHE_KEY,
    );

    if (cachedReservations) {
      console.log('CACHE HIT');
      return JSON.parse(String(cachedReservations));
    }

    console.log('CACHE MISS');
    const reservations = await this.reservationRepository.findAll();

    await this.redisService.set(
      this.RESERVATIONS_CACHE_KEY,
      JSON.stringify(reservations),
      this.CACHE_TTL,
    );

    return reservations;
  }

  async findOne(id: string) {
    const cacheKey = `reservation:${id}`;
    const cachedRes = await this.redisService.get(cacheKey);

    if (cachedRes) {
      console.log('CACHE HIT');
      return JSON.parse(String(cachedRes));
    }

    console.log('CACHE MISS');
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    await this.redisService.set(
      cacheKey,
      JSON.stringify(reservation),
      this.CACHE_TTL,
    );

    return reservation;
  }

  async updateStatus(id: string, status: ReservationStatus) {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const updated = await this.reservationRepository.update(id, { status });

    await this.redisService.del(this.RESERVATIONS_CACHE_KEY);
    await this.redisService.del(`reservation:${id}`);

    return updated;
  }

  async handleExpiredReservations() {
    const now = new Date();
    const expiredReservations =
      await this.reservationRepository.findExpiredReservations(now);

    if (expiredReservations.length === 0) {
      return { expiredCount: 0 };
    }

    console.log(
      `Found ${expiredReservations.length} expired reservations. Processing...`,
    );

    for (const res of expiredReservations) {
      try {
        // Update reservation status to EXPIRED
        await this.reservationRepository.update(res.id, {
          status: ReservationStatus.EXPIRED,
        });

        // Restore stock to RescueOffer
        const offer = await this.rescueOfferService.findOne(res.rescueOfferId);
        const newQty = offer.quantityAvailable + res.quantity;

        await this.rescueOfferService.updateRescueOffer(res.rescueOfferId, {
          quantityAvailable: newQty,
          // If it was SOLD_OUT or EXPIRED, reactivate it if we have stock
          status: OfferStatus.ACTIVE,
        });

        // Delete specific cache for this reservation
        await this.redisService.del(`reservation:${res.id}`);

        console.log(
          `Expired reservation ${res.id} and restored ${res.quantity} stock to offer ${res.rescueOfferId}`,
        );
      } catch (err) {
        console.error(
          `Failed to process expiry for reservation ${res.id}:`,
          err,
        );
      }
    }

    await this.redisService.del(this.RESERVATIONS_CACHE_KEY);

    return { expiredCount: expiredReservations.length };
  }
}
