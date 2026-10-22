FROM node:20-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@10
COPY . .
RUN pnpm install --frozen-lockfile

# 生产环境前端 API 走相对路径 /api，由 nginx 反向代理到后端
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE

RUN pnpm --filter @youmeng/web build

FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
