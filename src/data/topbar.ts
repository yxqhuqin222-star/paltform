// EXPORTS: ITool, MOCK_TOOLS
export interface ITool {
  id: string
  name: string
  description: string
  icon: string
  category: string
  type: 'iframe' | 'builtin' | 'placeholder' | 'external'
  url?: string
  sortOrder: number
  createdAt: string
  source?: 'mock' | 'user'
}

export const MOCK_TOOLS: ITool[] = [
  {
    id: '1',
    name: '人效成本监控',
    description: 'renxiao 人效/成本监控看板',
    icon: 'logos/5b3fb7df3a9e535a-comet-penguin.webp',
    category: '实用工具',
    type: 'external',
    url: 'https://yxqhuqin222-star.github.io/renxiao/',
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    id: '2',
    name: '随机生成器',
    description: '生成随机数、随机密码、随机分组',
    icon: 'logos/82d2ba7a09e29d99-octopus-8.webp',
    category: '实用工具',
    type: 'placeholder',
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    id: '3',
    name: '倒计时器',
    description: '正计时倒计时，支持多任务',
    icon: 'logos/99e352516e68f76d-moon-cactus.webp',
    category: '实用工具',
    type: 'placeholder',
    sortOrder: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    id: '4',
    name: 'Markdown 预览',
    description: '实时预览 Markdown 渲染效果',
    icon: 'logos/59a9ebe6e18dc63b-puffball-mushroom-2.webp',
    category: '文字处理',
    type: 'placeholder',
    sortOrder: 4,
    createdAt: '2024-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    id: '5',
    name: '文本对比',
    description: '两段文字差异对比',
    icon: 'logos/62f4eb9ac022c1ad-whale-16.png',
    category: '文字处理',
    type: 'placeholder',
    sortOrder: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    id: '6',
    name: 'JSON 格式化',
    description: 'JSON 格式化、压缩、校验',
    icon: 'logos/4723d948560b4901-night-router.webp',
    category: '实用工具',
    type: 'placeholder',
    sortOrder: 6,
    createdAt: '2024-01-01T00:00:00.000Z',
    source: 'mock',
  },
]
