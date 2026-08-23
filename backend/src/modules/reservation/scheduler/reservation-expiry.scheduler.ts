import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationService } from '../reservation.service';

@Injectable()
export class ReservationExpiryScheduler {
  private readonly logger = new Logger(ReservationExpiryScheduler.name);

  constructor(private readonly reservationService: ReservationService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Checking for expired reservations...');
    const result = await this.reservationService.handleExpiredReservations();
    if (result.expiredCount > 0) {
      this.logger.log(
        `Cleaned up ${result.expiredCount} expired reservations and released stock back to active offers.`,
      );
    }
  }
}
