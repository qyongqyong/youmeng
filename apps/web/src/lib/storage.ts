// 轻量本地持久化（演示阶段用 localStorage 模拟后端持久化）。
// 接入真实后端后，这些读写会替换为 API 调用。

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 忽略（隐私模式 / 存储已满）
  }
}

export function clearDemoData(): void {
  try {
    localStorage.removeItem('youmeng:auth');
    localStorage.removeItem('youmeng:dreams');
  } catch {
    // 忽略
  }
}
