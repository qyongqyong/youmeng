import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; name: string } {
    return { status: 'ok', name: 'youmeng-server' };
  }
}
