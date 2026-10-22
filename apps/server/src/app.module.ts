import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DreamsModule } from './dreams/dreams.module';

@Module({
  imports: [DreamsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
