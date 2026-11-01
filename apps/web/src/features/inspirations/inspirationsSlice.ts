import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Dream, DreamAuthor } from '@youmeng/shared';
import { mockInspirations } from '../../data/mockInspirations';
import { deriveTags } from '../../lib/tags';
import { loadJSON } from '../../lib/storage';

export type InspirationFeedTab = 'latest' | 'hot';

interface InspirationsState {
  items: Dream[];
  likedIds: string[];
  search: string;
  tab: InspirationFeedTab;
}

const STORAGE_KEY = 'youmeng:inspirations';

function loadInitialState(): InspirationsState {
  const persisted = loadJSON<Partial<InspirationsState>>(STORAGE_KEY, {});
  const seedById = new Map(mockInspirations.map((item) => [item.id, item]));
  const savedItems = (persisted.items ?? []).map((item) => {
    const seed = seedById.get(item.id);
    return seed ? { ...item, assets: seed.assets } : item;
  });
  const savedIds = new Set(savedItems.map((item) => item.id));
  return {
    items: savedItems.length
      ? [...savedItems, ...mockInspirations.filter((item) => !savedIds.has(item.id))]
      : mockInspirations,
    likedIds: persisted.likedIds ?? [],
    search: '',
    tab: 'latest',
  };
}

interface CreateInspirationArgs {
  content: string;
  author: DreamAuthor;
}

interface CreateInspirationResult extends CreateInspirationArgs {
  requestId: string;
  assets?: Dream['assets'];
}

export const createInspiration = createAsyncThunk<CreateInspirationResult, CreateInspirationArgs>(
  'inspirations/create',
  async (args, { requestId }) => {
    const baseUrl = import.meta.env.VITE_API_BASE ?? '/api';
    const response = await fetch(`${baseUrl}/dreams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: args.content,
        userId: args.author.id,
        nickname: args.author.nickname,
        category: 'inspiration',
      }),
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(error?.message ?? '灵感生成失败，请稍后重试');
    }
    const result = (await response.json()) as { assets?: Dream['assets'] };
    return { requestId, ...args, assets: result.assets };
  },
);

export const hydrateInspirations = createAsyncThunk<Dream[]>(
  'inspirations/hydrate',
  async () => {
    const baseUrl = import.meta.env.VITE_API_BASE ?? '/api';
    const response = await fetch(`${baseUrl}/feed?category=inspiration`);
    if (!response.ok) throw new Error('无法读取灵感专栏');
    return (await response.json()) as Dream[];
  },
);

const inspirationsSlice = createSlice({
  name: 'inspirations',
  initialState: loadInitialState(),
  reducers: {
    toggleInspirationLike(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (!item) return;
      const index = state.likedIds.indexOf(item.id);
      if (index >= 0) {
        state.likedIds.splice(index, 1);
        item.likeCount -= 1;
      } else {
        state.likedIds.push(item.id);
        item.likeCount += 1;
      }
    },
    setInspirationSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setInspirationTab(state, action: PayloadAction<InspirationFeedTab>) {
      state.tab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInspiration.pending, (state, action) => {
        const { content, author } = action.meta.arg;
        state.items.unshift({
          id: action.meta.requestId,
          userId: author.id,
          category: 'inspiration',
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
      .addCase(createInspiration.fulfilled, (state, action) => {
        const item = state.items.find((entry) => entry.id === action.payload.requestId);
        if (!item) return;
        item.status = 'published';
        item.assets = action.payload.assets ?? [];
        item.tags = deriveTags(action.payload.content);
      })
      .addCase(hydrateInspirations.fulfilled, (state, action) => {
        const existingIds = new Set(state.items.map((item) => item.id));
        for (const item of action.payload) {
          if (!existingIds.has(item.id)) state.items.unshift(item);
        }
      });
  },
});

export const {
  toggleInspirationLike,
  setInspirationSearch,
  setInspirationTab,
} = inspirationsSlice.actions;
export default inspirationsSlice.reducer;
