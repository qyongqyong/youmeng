import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Dream } from '@youmeng/shared';

// 后端地址：本地默认 http://localhost:3000，可用 VITE_API_BASE 覆盖。
// 首版信息流暂时由 mock 数据驱动，此 API 层为接入真实后端预留。
export const dreamsApi = createApi({
  reducerPath: 'dreamsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE ?? '/api',
  }),
  endpoints: (builder) => ({
    getFeed: builder.query<Dream[], void>({
      query: () => '/feed',
    }),
    getDream: builder.query<Dream, string>({
      query: (id) => `/dreams/${id}`,
    }),
  }),
});

export const { useGetFeedQuery, useGetDreamQuery } = dreamsApi;
