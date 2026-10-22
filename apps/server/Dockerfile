FROM node:20-alpine
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@10

# 复制整个仓库（monorepo：构建需要 workspace 与 packages/shared）
COPY . .

# 安装依赖并构建后端
RUN pnpm install --frozen-lockfile && pnpm --filter @youmeng/server build

WORKDIR /app/apps/server
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
