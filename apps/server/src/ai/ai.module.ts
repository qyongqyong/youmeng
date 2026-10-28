import { Module } from '@nestjs/common';
import { WanxiangService } from './wanxiang.service';

@Module({ providers: [WanxiangService], exports: [WanxiangService] })
export class AiModule {}
