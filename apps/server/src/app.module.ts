import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DreamsModule } from './dreams/dreams.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [DreamsModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
