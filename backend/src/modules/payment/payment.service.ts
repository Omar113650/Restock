import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReservationService } from '../reservation/reservation.service';
import { OrderService } from '../order/order.service';
import { NotificationService } from '../notification/notification.service';
import { CustomerService } from '../customer/customer.service';
import { ProcessPaymentDto } from './dto/payment.dto';
import { ReservationStatus, NotificationType } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly reservationService: ReservationService,
    private readonly orderService: OrderService,
    private readonly notificationService: NotificationService,
    private readonly customerService: CustomerService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }

  async processPayment(dto: ProcessPaymentDto) {
    const { reservationId, paymentMethodId } = dto;

    const reservation = await this.reservationService.findOne(reservationId);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new BadRequestException(
        `Reservation cannot be paid. Current status: ${reservation.status}`,
      );
    }

    if (new Date() > new Date(reservation.expiresAt)) {
      throw new BadRequestException('Reservation has expired');
    }

    const stripeCustomerId = await this.getStripeCustomer(
      reservation.customerId,
    );

    const amount = reservation.quantity * reservation.rescueOffer.discountPrice;

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',

        customer: stripeCustomerId,

        payment_method: paymentMethodId,

        confirm: true,

        metadata: {
          reservationId,
          customerId: reservation.customerId,
        },

        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException(
          `Payment failed with status: ${paymentIntent.status}`,
        );
      }

      await this.completeSuccessfulPayment(
        reservationId,
        amount,
        paymentIntent.id,
      );

      return {
        success: true,
        message: 'Payment processed successfully',
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Stripe payment error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Payment processing failed',
      );
    }
  }

  private async completeSuccessfulPayment(
    reservationId: string,
    amount: number,
    paymentIntentId: string,
  ) {
    const reservation = await this.reservationService.findOne(reservationId);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status === ReservationStatus.PAID) {
      return;
    }

    await this.reservationService.updateStatus(
      reservationId,
      ReservationStatus.PAID,
    );

    const order = await this.orderService.createOrder({
      reservationId,
      totalAmount: amount,
    });

    await this.notificationService.createNotification({
      recipientId: reservation.customerId,
      type: NotificationType.PAYMENT_SUCCESS,
      message: `Payment of $${(amount / 100).toFixed(
        2,
      )} was successful! Order #${order.id} is created.`,
      relatedOrderId: order.id,
    });

    return {
      order,
      paymentIntentId,
    };
  }

  private async getStripeCustomer(customerId: string): Promise<string> {
    const customer = await this.customerService.findOne(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.stripeCustomerId) {
      try {
        await this.stripe.customers.retrieve(customer.stripeCustomerId);

        return customer.stripeCustomerId;
      } catch {
        console.warn(`Stripe customer ${customer.stripeCustomerId} not found`);
      }
    }

    const stripeCustomer = await this.stripe.customers.create({
      name: customer.name,
      phone: customer.phone,
      metadata: {
        databaseId: customerId,
      },
    });

    await this.customerService.updateCustomer(customerId, {
      stripeCustomerId: stripeCustomer.id,
    });

    return stripeCustomer.id;
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    const stripeCustomerId = await this.getStripeCustomer(customerId);

    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: stripeCustomerId,
        },
      );

      await this.stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      return paymentMethod;
    } catch (error) {
      console.error('Stripe attach payment method error:', error);

      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to attach payment method',
      );
    }
  }

  async detachPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Stripe detach payment method error:', error);

      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to detach payment method',
      );
    }
  }

  async listCustomerPaymentMethods(
    customerId: string,
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    const stripeCustomerId = await this.getStripeCustomer(customerId);

    try {
      return await this.stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
      });
    } catch (error) {
      console.error('Stripe list payment methods error:', error);

      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to list payment methods',
      );
    }
  }

  async getPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    try {
      return await this.stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      console.error('Stripe retrieve payment method error:', error);

      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve payment method',
      );
    }
  }

  async updatePaymentMethod(
    paymentMethodId: string,
    billingDetails: Stripe.PaymentMethodUpdateParams.BillingDetails,
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    try {
      return await this.stripe.paymentMethods.update(paymentMethodId, {
        billing_details: billingDetails,
      });
    } catch (error) {
      console.error('Stripe update payment method error:', error);

      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update payment method',
      );
    }
  }

  async handleStripeWebhook(signature: string, rawBody: string | Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);

      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const reservationId = paymentIntent.metadata.reservationId;

        if (!reservationId) {
          break;
        }

        const reservation =
          await this.reservationService.findOne(reservationId);

        if (!reservation) {
          break;
        }

        if (reservation.status === ReservationStatus.PAID) {
          break;
        }

        const amount =
          reservation.quantity * reservation.rescueOffer.discountPrice;

        await this.completeSuccessfulPayment(
          reservationId,
          amount,
          paymentIntent.id,
        );

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.error(`Payment failed: ${paymentIntent.id}`);

        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return {
      received: true,
    };
  }
}
