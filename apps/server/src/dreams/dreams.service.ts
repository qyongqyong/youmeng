import { Injectable } from '@nestjs/common';
import type { Dream } from '@youmeng/shared';

@Injectable()
export class DreamsService {
  private dreams: Dream[] = [
    {
      id: '1',
      userId: 'u1',
      title: '我梦见自己站在了沙滩上',
      content: '黄昏的海边，天空是梦幻的紫橙色渐变，脚下的沙子泛着微光。',
      wordCount: 36,
      status: 'published',
      assets: [{ id: 'a1', type: 'image', url: '/previews/beach.png' }],
      tags: ['海'],
      likeCount: 128,
      commentCount: 12,
      author: { id: 'u1', nickname: '拾梦人' },
      createdAt: '2026-10-20T22:10:00Z',
    },
  ];

  getFeed(): Dream[] {
    return this.dreams;
  }

  createDream(body: { content: string }) {
    // TODO(M3)：接入文字合规审核 → 扣减积分 → 通义万相生图 / 可灵生视频
    return {
      id: String(Date.now()),
      content: body.content,
      wordCount: body.content.length,
      status: 'generating',
      assets: [],
    };
  }
}
