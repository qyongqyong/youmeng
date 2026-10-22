// 根据梦境文字简单派生标签（演示用，真实版本可交给 AI 打标签）
const TAG_RULES: { keywords: string[]; tag: string }[] = [
  { keywords: ['海', '沙滩', '浪', '水母'], tag: '海' },
  { keywords: ['星', '天空', '月', '飞', '云'], tag: '星空' },
  { keywords: ['森林', '树', '雾', '林'], tag: '自然' },
  { keywords: ['城市', '霓虹', '街', '楼'], tag: '城市' },
  { keywords: ['球', '球星', '足球', '球场'], tag: '运动' },
  { keywords: ['鲸', '深海', '鱼', '气泡'], tag: '深海' },
  { keywords: ['花', '草', '春天', '花园'], tag: '花海' },
  { keywords: ['极光', '雪', '北极'], tag: '极地' },
];

export function deriveTags(text: string): string[] {
  return TAG_RULES.filter((rule) =>
    rule.keywords.some((kw) => text.includes(kw)),
  )
    .map((rule) => rule.tag)
    .slice(0, 2);
}
