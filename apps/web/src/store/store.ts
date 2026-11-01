import { configureStore } from '@reduxjs/toolkit';
import { dreamsApi } from '../features/dreams/dreamsApi';
import dreamsReducer from '../features/dreams/dreamsSlice';
import inspirationsReducer from '../features/inspirations/inspirationsSlice';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import { saveJSON } from '../lib/storage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dreams: dreamsReducer,
    inspirations: inspirationsReducer,
    ui: uiReducer,
    [dreamsApi.reducerPath]: dreamsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dreamsApi.middleware),
});

// 持久化登录态与梦境数据（点赞、评论、发布记录），刷新不丢失
store.subscribe(() => {
  const state = store.getState();
  saveJSON('youmeng:auth', state.auth);
  saveJSON('youmeng:dreams', {
    items: state.dreams.items,
    likedIds: state.dreams.likedIds,
    comments: state.dreams.comments,
  });
  saveJSON('youmeng:inspirations', {
    items: state.inspirations.items,
    likedIds: state.inspirations.likedIds,
  });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
