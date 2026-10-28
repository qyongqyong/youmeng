import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Dream } from '@youmeng/shared';
import { WanxiangService } from '../ai/wanxiang.service';

@Injectable()
export class DreamsService {
  constructor(private readonly wanxiangService: WanxiangService) {}
  private readonly dataDir = existsSync(join(process.cwd(), 'apps/server'))
    ? join(process.cwd(), 'apps/server/data')
    : join(process.cwd(), 'data');
  private readonly storageDir = existsSync(join(process.cwd(), 'apps/server'))
    ? join(process.cwd(), 'apps/server/storage/generated')
    : join(process.cwd(), 'storage/generated');
  private readonly dataFile = join(this.dataDir, 'dreams.json');
  private dreams: Dream[] = this.loadDreams();

  private loadDreams(): Dream[] {
    if (existsSync(this.dataFile)) {
      return JSON.parse(readFileSync(this.dataFile, 'utf8')) as Dream[];
    }
    return [];
  }

  private saveDreams() {
    mkdirSync(this.dataDir, { recursive: true });
    writeFileSync(this.dataFile, JSON.stringify(this.dreams, null, 2));
  }

  private async saveImage(imageUrl: string, dreamId: string) {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`生成图片下载失败（${response.status}）`);
    mkdirSync(this.storageDir, { recursive: true });
    const fileName = `${dreamId}.png`;
    writeFileSync(join(this.storageDir, fileName), Buffer.from(await response.arrayBuffer()));
    return `/generated/${fileName}`;
  }

  getFeed(): Dream[] {
    return this.dreams.filter(
      (dream) =>
        !dream.userId.startsWith('seed-') &&
        !dream.assets[0]?.url.startsWith('/previews/'),
    );
  }

  async createDream(body: { content: string; userId?: string; nickname?: string }) {
    const content = body.content?.trim();
    if (!content) throw new Error('梦境内容不能为空');
    const id = String(Date.now());
    const imageUrl = await this.wanxiangService.generateImage(content);
    const savedImageUrl = await this.saveImage(imageUrl, id);
    const dream: Dream = {
      id,
      userId: body.userId ?? 'local-user',
      content,
      wordCount: content.length,
      status: 'published',
      assets: [{ id: `asset-${id}`, type: 'image', url: savedImageUrl }],
      tags: [],
      likeCount: 0,
      commentCount: 0,
      author: { id: body.userId ?? 'local-user', nickname: body.nickname ?? '梦友' },
      createdAt: new Date().toISOString(),
    };
    this.dreams.unshift(dream);
    this.saveDreams();
    return dream;
  }
}
