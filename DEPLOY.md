# 部署指南（不依赖 Vercel）

> 本项目默认方案里前端原本用 Vercel、后端用 Railway。若不想用 Vercel，可用以下任一方式部署到远端。

---

## 先想清楚：你现在要部署什么？

当前代码状态：

- **前端**（`apps/web`）是纯静态 SPA，登录 / 发布 / 生图 / 评论全部跑在浏览器 localStorage，**不依赖后端**。
- **后端**（`apps/server`）只是骨架（`/health`、`/feed`、`POST /dreams`），前端**尚未真正调用它**。

因此有两种选择：

| 选择 | 适用情况 | 成本 |
| --- | --- | --- |
| A. 只部署前端静态文件 | 现在就想让链接能打开、分享给朋友看效果 | 可免费（GitHub Pages / Netlify / Cloudflare Pages），或任意静态托管 |
| B. 前端 + 后端一起部署到一台 VPS | 后端接好后需要完整闭环 | 一台云服务器（阿里云 / 腾讯云 / 任意 VPS） |

---

## 方式 A：只部署前端（当前最简）

前端 `build` 后只产生静态文件，可以扔到任何静态托管。

### A1. GitHub Pages / Netlify / Cloudflare Pages

1. 本地构建：
   ```bash
   pnpm install
   pnpm --filter @youmeng/web build
   ```
   产物在 `apps/web/dist/`。
2. 把 `apps/web/dist/` 目录部署到托管平台：
   - **GitHub Pages**：把 `dist` 推送到 `gh-pages` 分支，或用 Actions。
   - **Netlify / Cloudflare Pages**：连接 GitHub 仓库，构建命令 `pnpm --filter @youmeng/web build`，发布目录 `apps/web/dist`。
3. 由于是 SPA（带 `/dream/1` 这类前端路由），需要配置**回退到 index.html**：
   - Netlify：加 `apps/web/_redirects` 内容 `/*  /index.html  200`。
   - Cloudflare Pages / GitHub Pages：多数平台已内置 SPA 回退，若 404 再补配置。

> 注意：纯静态托管下没有后端，`/api` 接口不可用——但对当前版本无影响，因为前端还没调用后端。

### A2. 阿里云 OSS / 腾讯云 COS + CDN

1. 构建得到 `apps/web/dist/`。
2. 上传到 OSS/COS 存储桶，开启静态网站托管。
3. 错误页（404）指向 `index.html` 即可支持前端路由。

---

## 方式 B：一台 VPS + Docker Compose（完整方案，推荐未来）

项目已提供好 `Dockerfile` 与 `docker-compose.yml`，一台上线即可。

### B1. 准备服务器

- 任意一台 Linux 服务器（阿里云 ECS / 腾讯云 CVM / 轻量应用服务器均可），建议 2C2G 起步。
- 放行端口：**80**（HTTP）、**443**（HTTPS）、22（SSH）。

### B2. 安装 Docker

以 Ubuntu/Debian 为例：

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
```

### B3. 上传代码并启动

```bash
git clone <你的仓库地址> youmeng && cd youmeng
docker compose up -d --build
```

完成后访问 `http://<服务器IP>/` 即可看到前端。

### B4. 常用命令

```bash
docker compose ps            # 查看服务状态
docker compose logs -f       # 查看日志
docker compose down          # 停止
docker compose up -d --build # 重新构建并启动（代码更新后）
```

### B5. 绑定域名 + HTTPS（强烈建议）

用 **Caddy** 最省事（自动申请并续期 Let's Encrypt 证书）。把 `docker-compose.yml` 中的 `web` 服务换成 Caddy 反代，或在服务器上单独跑 Caddy 反代到 80 端口。示意 `Caddyfile`：

```
your-domain.com {
    reverse_proxy localhost:80
}
```

或者给 `web` 服务用 Nginx + certbot 手动配证书。绑定域名后，国内访问若需备案，请按云厂商要求完成 ICP 备案。

---

## 方式 C：一台 VPS + Nginx + pm2（不想用 Docker）

1. 服务器装 Node 20+、pnpm、Nginx、pm2：
   ```bash
   npm i -g pnpm pm2
   ```
2. 构建前后端：
   ```bash
   pnpm install
   pnpm --filter @youmeng/web build
   pnpm --filter @youmeng/server build
   ```
3. 前端静态文件交给 Nginx：把 `apps/web/dist` 放到 `/var/www/youmeng`，用 `apps/web/nginx.conf`（把 `server:3000` 改成 `localhost:3000`）作为站点配置。
4. 后端用 pm2 常驻：
   ```bash
   cd apps/server && pm2 start dist/main.js --name youmeng-server && pm2 save && pm2 startup
   ```

---

## 环境变量说明

- 前端生产构建：`VITE_API_BASE=/api`（已作为 Docker 构建参数默认值，指向 nginx 反向代理）。本地开发默认 `http://localhost:3000`。
- 后端：见 `apps/server/.env.example`。目前这些变量（数据库、阿里云短信、DashScope、可灵）**尚未被代码使用**，等接入真实后端后再填。

---

## 常见问题

- **刷新 `/dream/1` 404**：静态服务器没配 SPA 回退。Nginx 用 `try_files ... /index.html`，其他托管平台开启「404 指向 index.html」。
- **前端调不到接口**：确认前端 `VITE_API_BASE=/api`，且 Nginx 把 `/api/` 反代到后端。
- **80 端口被占用**：把 `docker-compose.yml` 的 `"80:80"` 改成 `"8080:80"`，访问 `http://IP:8080`。
- **本机没有 Docker**：用「方式 C」（Nginx + pm2），或把代码推到一台装了 Docker 的服务器上执行。
