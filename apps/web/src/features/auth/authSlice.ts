import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@youmeng/shared';
import { loadJSON } from '../../lib/storage';

interface AuthState {
  user: User | null;
  /** 剩余生成额度（演示用） */
  credits: number;
}

const STORAGE_KEY = 'youmeng:auth';

const initialState: AuthState = loadJSON<AuthState>(STORAGE_KEY, {
  user: null,
  credits: 0,
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 演示版登录：真实版本会走 POST /auth/sms/verify（短信验证码 + JWT）
    login(state, action: PayloadAction<{ phone: string }>) {
      const phone = action.payload.phone;
      state.user = {
        id: `u-${phone}`,
        phone,
        nickname: `梦友${phone.slice(-4)}`,
        avatar: '🌙',
        gender: 'unknown',
        bio: '在有梦，记录每一个值得被记住的夜晚。',
      };
      // 新用户赠送 5 次生成额度
      state.credits = Math.max(state.credits, 5);
    },
    logout(state) {
      state.user = null;
      state.credits = 0;
    },
    updateProfile(
      state,
      action: PayloadAction<
        Partial<Pick<User, 'nickname' | 'avatar' | 'gender' | 'bio'>>
      >,
    ) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    spendCredit(state) {
      if (state.credits > 0) state.credits -= 1;
    },
    setCredits(state, action: PayloadAction<number>) {
      state.credits = action.payload;
    },
  },
});

export const { login, logout, updateProfile, spendCredit, setCredits } =
  authSlice.actions;
export default authSlice.reducer;
