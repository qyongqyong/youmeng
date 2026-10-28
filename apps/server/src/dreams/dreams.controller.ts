import { Body, Controller, Get, Post } from '@nestjs/common';
import type { Dream } from '@youmeng/shared';
import { DreamsService } from './dreams.service';

@Controller()
export class DreamsController {
  constructor(private readonly dreamsService: DreamsService) {}

  @Get('feed')
  getFeed(): Dream[] {
    return this.dreamsService.getFeed();
  }

  @Post('dreams')
  async createDream(@Body() body: { content: string; userId?: string; nickname?: string }) {
    return this.dreamsService.createDream(body);
  }
}
