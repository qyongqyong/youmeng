import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  LONG_DREAM_THRESHOLD,
  type Comment,
  type Dream,
  type DreamAuthor,
} from '@youmeng/shared';
import { mockDreams } from '../../data/mockDreams';
import { mockComments } from '../../data/mockComments';
import { deriveTags } from '../../lib/tags';
import { loadJSON } from '../../lib/storage';

// 演示用的占位图池：真实版本会由后端返回通义万相生成的图片
export const PREVIEW_IMAGES = [
  '/previews/beach.png',
  '/previews/football.png',
  '/previews/starry.png',
  '/previews/forest.png',
  '/previews/whale.png',
  '/previews/aurora.png',
  '/previews/city.png',
  '/previews/flower.png',
];

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
  // 若上次刷新时正处于「生成中」，这里补齐为已发布，避免出现卡住的卡片
  const items = (persisted.items ?? mockDreams).map((dream) =>
    dream.status === 'generating'
      ? {
          ...dream,
          status: 'published' as const,
          assets: [
            {
              id: `a-${dream.id}`,
              type: 'image' as const,
              url: PREVIEW_IMAGES[
                Math.floor(Math.random() * PREVIEW_IMAGES.length)
              ],
            },
          ],
        }
      : dream,
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
}

// 模拟「文字 → AI 生图」：真实版本会调用后端 POST /dreams → 通义万相
export const createDream = createAsyncThunk<CreateDreamResult, CreateDreamArgs>(
  'dreams/createDream',
  async (args, { requestId }) => {
    await new Promise((resolve) => setTimeout(resolve, 1600));
    return { requestId, ...args };
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
          const poster =
            PREVIEW_IMAGES[Math.floor(Math.random() * PREVIEW_IMAGES.length)];
          // 较长的梦境生成短视频，否则生成配图
          const isLong = content.length > LONG_DREAM_THRESHOLD;
          dream.assets = isLong
            ? [
                {
                  id: `a-${requestId}`,
                  type: 'video',
                  url: poster,
                  poster,
                  duration: 8 + Math.floor(Math.random() * 8),
                },
              ]
            : [{ id: `a-${requestId}`, type: 'image', url: poster }];
          dream.tags = deriveTags(content);
        }
      });
  },
});

export const { toggleLike, addComment, setSearch, setTab, clearLikes } =
  dreamsSlice.actions;
export default dreamsSlice.reducer;
