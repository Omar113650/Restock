import { ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export const wsValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (errors) => {
    const messages = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat();

    return new WsException(messages);
  },
});