import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { ContentCategory, Dream } from '@youmeng/shared';
import { DreamsService } from './dreams.service';

@Controller()
export class DreamsController {
  constructor(private readonly dreamsService: DreamsService) {}

  @Get('feed')
  getFeed(@Query('category') category?: ContentCategory): Dream[] {
    return this.dreamsService.getFeed(category);
  }

  @Post('dreams')
  async createDream(@Body() body: { content: string; userId?: string; nickname?: string; category?: ContentCategory }) {
    return this.dreamsService.createDream(body);
  }
}
