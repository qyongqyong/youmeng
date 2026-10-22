import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: string;
  text: string;
  type: ToastType;
}

interface UiState {
  toasts: Toast[];
}

const initialState: UiState = {
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    pushToast(state, action: PayloadAction<{ text: string; type?: ToastType }>) {
      state.toasts.push({
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: action.payload.text,
        type: action.payload.type ?? 'info',
      });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { pushToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
