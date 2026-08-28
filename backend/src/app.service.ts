import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health(): string {
    return 'every thing is Ok!';
  }
}
