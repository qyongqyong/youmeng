// 有梦项目：前后端共享类型与常量

export type AssetType = 'image' | 'video';

export interface DreamAsset {
  id: string;
  type: AssetType;
  /** 图片地址，或视频封面/地址 */
  url: string;
  /** 视频时长（秒），图片为 undefined */
  duration?: number;
  /** 视频封面（可选） */
  poster?: string;
}

export type DreamStatus =
  | 'draft'
  | 'generating'
  | 'generated'
  | 'published'
  | 'rejected';

export interface DreamAuthor {
  id: string;
  nickname: string;
  avatar?: string;
}

export interface Dream {
  id: string;
  userId: string;
  /** 标题（可选）：用户仅描述梦境，无需填写标题 */
  title?: string;
  content: string;
  wordCount: number;
  status: DreamStatus;
  assets: DreamAsset[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  author: DreamAuthor;
  createdAt: string;
}

export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  dreamId: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: string;
}

/** 长梦境判定阈值（字数），超过则触发生视频 */
export const LONG_DREAM_THRESHOLD = 80;
