# 有梦（YouMeng）

用文字记录梦境，一键生成梦境配图 / 短视频，并在「梦圈」频道公开分享的 AI 梦境社区。

## 技术栈

- 前端：Vite + React + Redux Toolkit (RTK) + TypeScript（部署 Vercel）
- 后端：Node.js + NestJS + TypeScript（部署 Railway）
- 移动端：React Native（预留，首版不实现）
- 仓库：pnpm workspaces Monorepo

## 目录结构

```
apps/
  web/        # 前端
  server/     # 后端
packages/
  shared/     # 前后端共享类型
```

## 快速开始

```bash
pnpm install
pnpm dev        # 同时启动 web(5173) 与 server(3000)
```

单独启动：

```bash
pnpm dev:web      # http://localhost:5173
pnpm dev:server   # http://localhost:3000
```

## 文档

- [PLAN.md](./PLAN.md)：项目计划文档（技术选型、数据模型、里程碑）
- [DEPLOY.md](./DEPLOY.md)：部署指南（不依赖 Vercel，含 Docker Compose / Nginx+pm2 / 静态托管）
