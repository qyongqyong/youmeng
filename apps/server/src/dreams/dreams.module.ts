import { Module } from '@nestjs/common';
import { DreamsController } from './dreams.controller';
import { DreamsService } from './dreams.service';

@Module({
  controllers: [DreamsController],
  providers: [DreamsService],
})
export class DreamsModule {}
