import type { Dream } from '@youmeng/shared';

// 从梦境描述中提取第一句作为展示标题
export function deriveTitle(content: string): string {
  const first = content.split(/[。！？!?\n]/)[0]?.trim() ?? content.trim();
  const max = 18;
  return first.length > max ? `${first.slice(0, max)}…` : first;
}

// 展示标题：优先用已有标题，否则从描述提取
export function displayTitle(dream: Dream): string {
  return dream.title || deriveTitle(dream.content) || '未命名梦境';
}
