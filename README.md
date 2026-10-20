# 有梦

有梦是一个把梦境写下来，并生成视觉内容的创作社区。当前仓库包含梦圈 MVP：公开梦境流、演示帖子、发布梦境、点赞和 AI 生成任务占位接口。

## 本地启动

需要 Node.js 20+。

```bash
npm install
npm run dev
```

- Web：http://localhost:5173
- API：http://localhost:3001

## 当前范围

- 公开梦境流，默认所有内容公开
- 3 条演示梦境
- 创建梦境并发布到内存数据
- 点赞
- 图片/短视频生成任务的异步接口占位
- Web 端 React + TypeScript + RTK
- Node.js + Fastify API

当前数据存储在内存中，服务重启后会恢复为演示数据。下一步接入 PostgreSQL、Redis 队列、对象存储、真实登录和内容审核。
