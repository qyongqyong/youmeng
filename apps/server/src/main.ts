import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  // API 统一前缀，避免与前端路由冲突
  app.setGlobalPrefix('api');

  // 单服务部署：若前端已构建，则托管静态文件并提供 SPA 回退
  // __dirname 为 apps/server/dist，回退两级到 apps/web/dist
  const webDist = join(__dirname, '..', '..', 'web', 'dist');
  if (existsSync(join(webDist, 'index.html'))) {
    app.useStaticAssets(webDist, { index: false });
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
        res.sendFile('index.html', { root: webDist });
      } else {
        next();
      }
    });
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`有梦后端已启动：http://localhost:${port}`);
}
bootstrap();
