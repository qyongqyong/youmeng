import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface WanResponse {
  code?: string;
  message?: string;
  output?: {
    task_id?: string;
    task_status?: string;
    choices?: Array<{ message?: { content?: Array<{ image?: string; type?: string }> } }>;
  };
}

@Injectable()
export class WanxiangService {
  private readonly apiKey = process.env.DASHSCOPE_API_KEY;
  private readonly baseUrl = (process.env.DASHSCOPE_BASE_URL ?? 'https://dashscope.aliyuncs.com/api/v1').replace(/\/$/, '');
  private readonly model = process.env.DASHSCOPE_IMAGE_MODEL ?? 'wan2.6-image';

  async generateImage(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('未配置 DASHSCOPE_API_KEY');
    }

    if (this.model.startsWith('qwen-image')) {
      return this.generateQwenImage(prompt);
    }

    const createResponse = await fetch(`${this.baseUrl}/services/aigc/image-generation/generation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          messages: [{ role: 'user', content: [{ text: prompt }] }],
        },
        parameters: { n: 1, size: '1024*1024', watermark: false },
      }),
    });
    const created = (await createResponse.json()) as WanResponse;
    if (!createResponse.ok || !created.output?.task_id) {
      throw new InternalServerErrorException(created.message ?? `万相提交失败（${createResponse.status}）`);
    }

    const taskId = created.output.task_id;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusResponse = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const status = (await statusResponse.json()) as WanResponse;
      const taskStatus = status.output?.task_status;
      if (taskStatus === 'SUCCEEDED') {
        const image = status.output?.choices?.[0]?.message?.content?.find((item) => item.image)?.image;
        if (image) return image;
        throw new InternalServerErrorException('万相已完成，但没有返回图片地址');
      }
      if (taskStatus === 'FAILED' || taskStatus === 'CANCELED') {
        throw new InternalServerErrorException(status.message ?? `万相任务${taskStatus}`);
      }
    }

    throw new InternalServerErrorException('万相生成超时，请稍后重试');
  }

  private async generateQwenImage(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/services/aigc/multimodal-generation/generation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: { messages: [{ role: 'user', content: [{ text: prompt }] }] },
        parameters: {
          size: '2048*2048',
          n: 1,
          prompt_extend: true,
          watermark: false,
        },
      }),
    });
    const result = (await response.json()) as WanResponse;
    const image = result.output?.choices?.[0]?.message?.content?.find((item) => item.image)?.image;
    if (!response.ok || !image) {
      throw new InternalServerErrorException(result.message ?? `Qwen-Image 生成失败（${response.status}）`);
    }
    return image;
  }
}
