// import { Body, Controller, Post, Get, Param, Headers, Req } from '@nestjs/common';
// import { PaymentService } from './payment.service';
// import { ProcessPaymentDto, AttachPaymentMethodDto } from './dto/payment.dto';
// import { Request } from 'express';

// @Controller('payments')
// export class PaymentController {
//   constructor(private readonly paymentService: PaymentService) {}

//   @Post()
//   async processPayment(@Body() processPaymentDto: ProcessPaymentDto) {
//     return this.paymentService.processPayment(processPaymentDto);
//   }

//   @Post('methods/attach')
//   async attachPaymentMethod(@Body() attachDto: AttachPaymentMethodDto) {
//     return this.paymentService.attachPaymentMethod(
//       attachDto.customerId,
//       attachDto.paymentMethodId,
//     );
//   }

//   @Post('methods/:id/detach')
//   async detachPaymentMethod(@Param('id') paymentMethodId: string) {
//     return this.paymentService.detachPaymentMethod(paymentMethodId);
//   }

//   @Get('methods/customer/:customerId')
//   async listCustomerPaymentMethods(@Param('customerId') customerId: string) {
//     return this.paymentService.listCustomerPaymentMethods(customerId);
//   }

//   @Post('webhook')
//   async handleWebhook(
//     @Headers('stripe-signature') signature: string,
//     @Req() request: Request,
//   ) {
//     // NOTE: To verify Stripe signatures, rawBody: true must be passed to NestFactory.create in main.ts
//     const rawBody = (request as any).rawBody || JSON.stringify(request.body);
//     return this.paymentService.handleStripeWebhook(signature, rawBody);
//   }
// }
