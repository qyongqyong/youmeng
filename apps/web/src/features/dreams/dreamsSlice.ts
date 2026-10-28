import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  type Comment,
  type Dream,
  type DreamAuthor,
} from '@youmeng/shared';
import { mockDreams } from '../../data/mockDreams';
import { mockComments } from '../../data/mockComments';
import { deriveTags } from '../../lib/tags';
import { loadJSON } from '../../lib/storage';

export type FeedTab = 'latest' | 'hot';

interface DreamsState {
  items: Dream[];
  likedIds: string[];
  comments: Record<string, Comment[]>;
  search: string;
  tab: FeedTab;
}

const STORAGE_KEY = 'youmeng:dreams';

interface PersistedDreams {
  items: Dream[];
  likedIds: string[];
  comments: Record<string, Comment[]>;
}

function loadInitialState(): DreamsState {
  const persisted = loadJSON<Partial<PersistedDreams>>(STORAGE_KEY, {});
  // 生成中的任务不能用本地占位图伪装成已完成；后续由任务状态恢复逻辑处理。
  const seedById = new Map(mockDreams.map((dream) => [dream.id, dream]));
  const seedByContent = new Map(mockDreams.map((dream) => [dream.content, dream]));
  const savedItems = (persisted.items ?? []).map((dream) => {
    const seed = seedById.get(dream.id) ?? seedByContent.get(dream.content);
    return seed ? { ...dream, assets: seed.assets } : dream;
  });
  const savedIds = new Set(savedItems.map((dream) => dream.id));
  const seedItems = savedItems.length
    ? [...savedItems, ...mockDreams.filter((dream) => !savedIds.has(dream.id))]
    : mockDreams;
  // 本地同步生成链路不会跨刷新保留任务；清理旧版本遗留的空生成卡片。
  const items = seedItems.filter(
    (dream) => !(dream.status === 'generating' && dream.assets.length === 0),
  );
  return {
    items,
    likedIds: persisted.likedIds ?? [],
    comments: persisted.comments ?? mockComments,
    search: '',
    tab: 'latest',
  };
}

const initialState: DreamsState = loadInitialState();

interface CreateDreamArgs {
  content: string;
  author: DreamAuthor;
}

interface CreateDreamResult extends CreateDreamArgs {
  requestId: string;
  assets?: Dream['assets'];
}

// 模拟「文字 → AI 生图」：真实版本会调用后端 POST /dreams → 通义万相
export const createDream = createAsyncThunk<CreateDreamResult, CreateDreamArgs>(
  'dreams/createDream',
  async (args, { requestId }) => {
    const baseUrl = import.meta.env.VITE_API_BASE ?? '/api';
    const response = await fetch(`${baseUrl}/dreams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: args.content,
        userId: args.author.id,
        nickname: args.author.nickname,
      }),
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(error?.message ?? '梦境生成失败');
    }
    const result = (await response.json()) as { assets?: Dream['assets'] };
    console.info('[createDream] backend assets:', result.assets);
    return { requestId, ...args, assets: result.assets };
  },
);

export const hydrateDreams = createAsyncThunk<Dream[]>(
  'dreams/hydrateDreams',
  async () => {
    const baseUrl = import.meta.env.VITE_API_BASE ?? '/api';
    const response = await fetch(`${baseUrl}/feed`);
    if (!response.ok) throw new Error('无法读取已保存的梦境');
    return (await response.json()) as Dream[];
  },
);

interface AddCommentPayload {
  dreamId: string;
  content: string;
  author: DreamAuthor;
}

const dreamsSlice = createSlice({
  name: 'dreams',
  initialState,
  reducers: {
    toggleLike(state, action: PayloadAction<string>) {
      const id = action.payload;
      const dream = state.items.find((d) => d.id === id);
      if (!dream) return;

      const idx = state.likedIds.indexOf(id);
      if (idx >= 0) {
        state.likedIds.splice(idx, 1);
        dream.likeCount -= 1;
      } else {
        state.likedIds.push(id);
        dream.likeCount += 1;
      }
    },
    addComment(state, action: PayloadAction<AddCommentPayload>) {
      const { dreamId, content, author } = action.payload;
      const comment: Comment = {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dreamId,
        userId: author.id,
        nickname: author.nickname,
        content,
        createdAt: new Date().toISOString(),
      };
      if (!state.comments[dreamId]) state.comments[dreamId] = [];
      state.comments[dreamId].push(comment);

      const dream = state.items.find((d) => d.id === dreamId);
      if (dream) dream.commentCount += 1;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setTab(state, action: PayloadAction<FeedTab>) {
      state.tab = action.payload;
    },
    clearLikes(state) {
      state.likedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDream.pending, (state, action) => {
        const { content, author } = action.meta.arg;
        state.items.unshift({
          id: action.meta.requestId,
          userId: author.id,
          content,
          wordCount: content.length,
          status: 'generating',
          assets: [],
          tags: [],
          likeCount: 0,
          commentCount: 0,
          author,
          createdAt: new Date().toISOString(),
        });
      })
      .addCase(createDream.fulfilled, (state, action) => {
        const { requestId, content } = action.payload;
        const dream = state.items.find((d) => d.id === requestId);
        if (dream) {
          dream.status = 'published';
          dream.assets = action.payload.assets ?? [];
          dream.tags = deriveTags(content);
        }
      });
    builder.addCase(hydrateDreams.fulfilled, (state, action) => {
      const existingIds = new Set(state.items.map((dream) => dream.id));
      for (const dream of action.payload) {
        if (!existingIds.has(dream.id)) state.items.unshift(dream);
      }
    });
  },
});

export const { toggleLike, addComment, setSearch, setTab, clearLikes } =
  dreamsSlice.actions;
export default dreamsSlice.reducer;
