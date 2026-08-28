import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ProcessPaymentDto, AttachPaymentMethodDto } from './dto/payment.dto';
import type { Request } from 'express';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async processPayment(@Body() processPaymentDto: ProcessPaymentDto) {
    return this.paymentService.processPayment(processPaymentDto);
  }

  @Post('methods/attach')
  async attachPaymentMethod(
    @Body() attachDto: AttachPaymentMethodDto,
  ): Promise<any> {
    return this.paymentService.attachPaymentMethod(
      attachDto.customerId,
      attachDto.paymentMethodId,
    );
  }

  @Post('methods/:id/detach')
  async detachPaymentMethod(
    @Param('id') paymentMethodId: string,
  ): Promise<any> {
    return this.paymentService.detachPaymentMethod(paymentMethodId);
  }

  @Get('methods/customer/:customerId')
  async listCustomerPaymentMethods(
    @Param('customerId') customerId: string,
  ): Promise<any> {
    return this.paymentService.listCustomerPaymentMethods(customerId);
  }

  @Get('methods/:id')
  async getPaymentMethod(@Param('id') paymentMethodId: string): Promise<any> {
    return this.paymentService.getPaymentMethod(paymentMethodId);
  }

  @Post('methods/:id')
  async updatePaymentMethod(
    @Param('id') paymentMethodId: string,
    @Body() billingDetails: any,
  ): Promise<any> {
    return this.paymentService.updatePaymentMethod(
      paymentMethodId,
      billingDetails,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request,
  ) {
    const rawBody = (request as any).rawBody;

    if (!rawBody) {
      throw new Error(
        'Raw body not available - ensure rawBody: true is set in NestFactory.create',
      );
    }

    return this.paymentService.handleStripeWebhook(signature, rawBody);
  }
}
