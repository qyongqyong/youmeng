import Fastify from 'fastify';
import cors from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  avatar: string;
  mood: string;
  palette: string;
  likes: number;
  comments: number;
  createdAt: string;
  generated: boolean;
};

const posts: Post[] = [
  {
    id: 'dream-concert',
    title: '我梦见自己去演唱会了',
    content: '舞台像一片漂浮在夜空里的海，灯光落下来的时候，所有人都在发光。我站在人群中，却清楚地听见了自己的心跳。',
    author: '星河旅人',
    avatar: '星',
    mood: '热烈',
    palette: 'concert',
    likes: 128,
    comments: 16,
    createdAt: '刚刚',
    generated: true
  },
  {
    id: 'dream-ronaldo',
    title: '梦见跟 C 罗踢球了',
    content: '夕阳下的球场没有观众，只有风和草地。C 罗把球传给我，我们一起冲向球门，最后一脚像是把整个童年都踢进了晚霞。',
    author: '不睡觉的球迷',
    avatar: '球',
    mood: '自由',
    palette: 'football',
    likes: 96,
    comments: 12,
    createdAt: '12 分钟前',
    generated: true
  },
  {
    id: 'dream-library',
    title: '海底有一座只在夜里开门的图书馆',
    content: '我推开珊瑚做的门，书页里藏着鲸鱼的歌。管理员说，每个人只能带走一本写着自己名字的书。',
    author: '月亮邮差',
    avatar: '月',
    mood: '宁静',
    palette: 'ocean',
    likes: 74,
    comments: 8,
    createdAt: '36 分钟前',
    generated: true
  }
];

const createPostSchema = z.object({
  title: z.string().trim().min(2).max(80),
  content: z.string().trim().min(8).max(2000),
  mood: z.string().trim().min(1).max(20).default('朦胧')
});

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get('/health', async () => ({ ok: true, service: 'youmeng-api' }));

app.get('/api/posts', async () => ({ posts }));

app.post('/api/posts', async (request, reply) => {
  const parsed = createPostSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ message: '梦境内容不符合要求', issues: parsed.error.flatten() });
  }
  const post: Post = {
    id: randomUUID(),
    title: parsed.data.title,
    content: parsed.data.content,
    author: '我的梦境',
    avatar: '我',
    mood: parsed.data.mood,
    palette: 'purple',
    likes: 0,
    comments: 0,
    createdAt: '刚刚',
    generated: false
  };
  posts.unshift(post);
  return reply.code(201).send({ post });
});

app.post('/api/posts/:id/like', async (request, reply) => {
  const params = z.object({ id: z.string() }).safeParse(request.params);
  if (!params.success) return reply.code(400).send({ message: '参数错误' });
  const post = posts.find((item) => item.id === params.data.id);
  if (!post) return reply.code(404).send({ message: '梦境不存在' });
  post.likes += 1;
  return { likes: post.likes };
});

app.post('/api/generations', async (request, reply) => {
  const body = z.object({ postId: z.string(), type: z.enum(['image', 'video']) }).safeParse(request.body);
  if (!body.success) return reply.code(400).send({ message: '生成参数错误' });
  return reply.code(202).send({
    job: {
      id: randomUUID(),
      postId: body.data.postId,
      type: body.data.type,
      status: 'queued',
      message: '演示任务已进入队列，接入模型服务后会在这里返回生成结果。'
    }
  });
});

const port = Number(process.env.PORT ?? 3001);
await app.listen({ port, host: '0.0.0.0' });
