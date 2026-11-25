// EXPORTS: ITool, MOCK_TOOLS, WEEKLY_REPORT_TOOL, JUNIOR_WEEKLY_REPORT_TOOL
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

export const WEEKLY_REPORT_TOOL: ITool = {
  id: 'weekly-report',
  name: '高中周报',
  description: '上传两份底表，更新总表并导出周报图片',
  icon: 'logos/62f4eb9ac022c1ad-whale-16.png',
  category: '实用工具',
  type: 'builtin',
  sortOrder: 7,
  createdAt: '2026-11-23T00:00:00.000Z',
  source: 'mock',
}

export const JUNIOR_WEEKLY_REPORT_TOOL: ITool = {
  id: 'junior-weekly-report',
  name: '初中周报',
  description: '上传最新期次的 Excel，导出渠道价体对比长图',
  icon: 'logos/62f4eb9ac022c1ad-whale-16.png',
  category: '实用工具',
  type: 'builtin',
  sortOrder: 8,
  createdAt: '2026-11-25T00:00:00.000Z',
  source: 'mock',
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
  WEEKLY_REPORT_TOOL,
  JUNIOR_WEEKLY_REPORT_TOOL,
]
