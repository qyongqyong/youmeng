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

## 远程部署

### Vercel

将仓库导入 Vercel，项目根目录保持仓库根目录，配置 `VITE_API_BASE_URL` 为 Railway API 的公开域名。仓库中的 `vercel.json` 已配置 Web 构建命令和输出目录。

### Railway

从同一个 GitHub 仓库创建服务，使用仓库根目录。仓库中的 `railway.json` 已配置 API 构建、启动和健康检查。Railway 生成公开域名后，将它填入 Vercel 的 `VITE_API_BASE_URL`，再重新部署 Web。

## 当前范围

- 公开梦境流，默认所有内容公开
- 3 条演示梦境
- 创建梦境并发布到内存数据
- 点赞
- 图片/短视频生成任务的异步接口占位
- Web 端 React + TypeScript + RTK
- Node.js + Fastify API

当前数据存储在内存中，服务重启后会恢复为演示数据。下一步接入 PostgreSQL、Redis 队列、对象存储、真实登录和内容审核。
