import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // swagger
  const config = new DocumentBuilder()
    .setTitle('Restock API')
    .setDescription(
      'REST API for the Restock platform — manage products, batches, customers, rescue offers, reservations, orders, and notifications.',
    )
    .setVersion('1.0')
    .addTag('Products', 'CRUD operations for products')
    .addTag('Batches', 'CRUD operations for product batches')
    .addTag('Customers', 'CRUD operations for customers')
    .addTag(
      'Rescue Offers',
      'Manage rescue / discounted offers for expiring batches',
    )
    .addTag('Reservations', 'Customer reservations on rescue offers')
    .addTag('Orders', 'View and manage orders generated from reservations')
    .addTag('Notifications', 'Customer notification management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(
    `Swagger UI: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}

bootstrap();
