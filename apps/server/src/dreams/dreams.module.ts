import { Module } from '@nestjs/common';
import { DreamsController } from './dreams.controller';
import { DreamsService } from './dreams.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [DreamsController],
  providers: [DreamsService],
})
export class DreamsModule {}
