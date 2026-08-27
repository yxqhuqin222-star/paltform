# 小工具集合平台 - 需求拆解文档

## 产品概述

- **产品类型**: 工具集合平台（Web 应用）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 需要使用各种小工具的普通用户
- **核心价值**: 极简清爽的工具目录平台，集中展示和管理各类小工具，支持浏览、搜索、使用与后续扩展
- **界面语言**: 中文
- **主题偏好**: 浅色（极简清爽风格，背景色 #F8FAFC）
- **导航模式**: 路径导航
- **导航布局**: 响应式 —— 移动端底部导航栏（Bottom Nav），桌面端顶部导航（Topbar）

---

## 页面结构总览

> **说明**：此表为页面生成的唯一数据源，包含所有页面（一级+二级）

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 工具广场（首页） | `HomePage.tsx` | `/` | 一级 | 导航 |
| 工具详情/使用页 | `ToolDetailPage.tsx` | `/tool/:id` | 二级 | 工具广场 → 点击工具卡片/立即使用按钮 |
| 工具管理页 | `ManagePage.tsx` | `/manage` | 一级 | 导航 |

> **页面类型说明**：
> - **一级页面**：出现在导航中，用户可直接访问（首页、管理页）
> - **二级页面**：不在导航中，从一级页面跳转进入（工具详情页）

---

## 页面布局建议

### 工具广场（首页）布局

- **布局模式**: 上下分区（顶部搜索筛选区 + 主体卡片网格区 + 底部提示区）
- **视觉重心**: 工具卡片网格列表 —— 用户核心任务是浏览和找到工具
- **结果承载区**: 工具卡片网格（响应式：移动端1列，平板2列，桌面3-4列）；初始态为默认 6 个示例工具 + 2 个分类
- **特殊说明**: 分类标签可横向滚动（移动端），搜索框全宽

### 工具详情页布局

- **布局模式**: 单栏上下结构（顶部返回栏 + 工具信息区 + 工具操作区 + 说明区）
- **视觉重心**: 工具操作区域（iframe/内联组件容器）—— 用户核心任务是使用工具
- **结果承载区**: 工具嵌入区域（iframe 或 placeholder 占位）；placeholder 类型显示「功能开发中」占位说明
- **特殊说明**: 操作区域高度自适应，iframe 类型占满可用空间

### 工具管理页布局

- **布局模式**: 上下分区（添加工具表单区 + 已有工具列表区 + 分类管理区 + 导入导出区）
- **视觉重心**: 已有工具列表 —— 管理页核心是增删改查工具
- **结果承载区**: 工具列表（可编辑、删除、调整顺序）；初始态显示默认 6 个示例工具
- **特殊说明**: 表单与列表可采用 Tab 切换或分区排布，移动端单列

---

## 导航配置

> **说明**：此表为导航生成的数据源，路由需与页面结构总览一致
> 响应式导航策略：移动端（< 768px）使用底部导航栏（Bottom Nav），桌面端使用顶部导航（Topbar）

- **导航布局**: 响应式 —— 移动端 Bottom Nav，桌面端 Topbar
- **导航项**（仅一级页面）:

| 导航文字 | 路由 | 图标(可选) | 显示位置 |
|---------|------|-----------|---------|
| 工具广场 | `/` | Home | 底部导航 + 顶部导航 |
| 管理 | `/manage` | Settings | 底部导航 + 顶部导航 |

- **移动端底部导航要求**:
  - 固定在底部，高度 ≥ 56px
  - 触控目标 ≥ 44px
  - 适配底部安全区 `env(safe-area-inset-bottom)`
  - 选中态使用主色 #3B82F6

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 工具列表数据 | local-persist | localStorage key=`__toolbox_tools`，首次加载注入 6 条默认示例工具 | 6 条 source='mock' 示例工具（单位换算器、随机生成器、倒计时器、Markdown 预览、文本对比、JSON 格式化） |
| 分类列表数据 | local-persist | localStorage key=`__toolbox_categories`，首次加载注入 2 条默认分类 | 2 条 source='mock' 示例分类（实用工具🔧、文字处理📝） |
| 搜索关键词状态 | demo-mock | React 本地 state，实时过滤工具列表 | 无 |
| 当前筛选分类 | demo-mock | React 本地 state，点击分类标签切换 | 无 |
| 工具数据导出 | import-export | Blob + URL.createObjectURL + a.click 触发 JSON 文件下载 | 无 |
| 工具数据导入 | real-file | File API 读取 .json 文件，校验结构后预览新增/覆盖数量，确认后写入 localStorage | 无 |
| 清空全部数据 | local-persist | 二次确认后清除 `__toolbox_tools` 和 `__toolbox_categories`，恢复初始默认数据 | 无 |

> 类型选择 + 兜底约束见上方"数据来源声明方法论"段。

---

## 功能列表

### 工具广场（首页）

- **页面目标**: 浏览工具列表 → 找到需要的工具 → 点击进入使用
- **功能点**:
  - **工具搜索**: 顶部搜索框输入关键词，实时过滤工具卡片（匹配工具名称和描述）
  - **分类筛选**: 点击分类标签筛选对应分类的工具，支持「全部」和各分类切换
  - **工具卡片展示**: 响应式网格布局，每张卡片含 emoji 图标、工具名称、一句话描述、「立即使用」按钮
  - **进入工具详情**: 点击工具卡片或「立即使用」按钮，跳转到工具详情页 `/tool/:id`
  - **数据导出**: 底部导出按钮，将 tools + categories 导出为 JSON 文件（含 schemaVersion、导出时间）
  - **数据导入**: 底部导入按钮，选择 JSON 文件后校验结构，预览新增/覆盖数量，确认后导入
  - **短期存储提示**: 页面底部可见位置显示存储提示文案

### 工具详情/使用页

- **页面目标**: 使用具体工具功能，查看使用说明
- **功能点**:
  - **返回首页**: 顶部返回按钮，点击回到工具广场首页
  - **工具信息展示**: 显示工具名称、图标、简介
  - **工具操作区域**: 根据工具类型渲染不同内容 —— placeholder 类型显示「功能开发中」占位，iframe 类型嵌入对应 URL
  - **工具使用说明**: 说明区展示使用说明和注意事项（placeholder 类型显示通用占位说明）

### 工具管理页

- **页面目标**: 添加、编辑、删除工具，管理分类，导入导出数据
- **功能点**:
  - **添加新工具**: 表单含名称、描述、图标（emoji）、分类下拉、类型选择、URL（iframe 类型显示），提交后新增到工具列表
  - **编辑工具**: 工具列表行内「编辑」按钮，弹出表单（同新增表单）修改后保存
  - **删除工具**: 工具列表行内「删除」按钮，二次确认后从列表移除
  - **调整工具顺序**: 支持上下移动调整 sortOrder（或拖拽排序，最简模式可用上下箭头按钮）
  - **分类管理**: 添加/编辑/删除分类（名称 + emoji 图标），分类列表展示
  - **导入导出入口**: 管理页底部的导入导出按钮，功能同首页
  - **清空全部数据**: 提供清空按钮，二次确认后清除所有工具和分类数据，恢复默认示例

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__toolbox_tools` | 工具列表数据，类型为 `ITool[]` | 工具广场、工具详情、工具管理 |
| `__toolbox_categories` | 分类列表数据，类型为 `ICategory[]` | 工具广场、工具管理 |
| `__toolbox_currentView` | 当前视图状态，类型为 `'home' \| 'tool-detail' \| 'manage'` | 全局导航 |
| `__toolbox_currentToolId` | 当前选中的工具 ID，类型为 `string` | 工具详情页 |

```ts
interface ITool {
  /** 工具唯一标识 */
  id: string;
  /** 工具名称 */
  name: string;
  /** 一句话描述 */
  description: string;
  /** emoji 图标 */
  icon: string;
  /** 分类 ID 或分类名称 */
  category: string;
  /** 工具类型 */
  type: 'iframe' | 'builtin' | 'placeholder';
  /** 工具链接（iframe 类型用） */
  url?: string;
  /** 排序权重，数字越小越靠前 */
  sortOrder: number;
  /** 创建时间 ISO 字符串 */
  createdAt: string;
  /** 数据来源标记 */
  source?: 'mock' | 'user';
}

interface ICategory {
  /** 分类唯一标识 */
  id: string;
  /** 分类名称 */
  name: string;
  /** emoji 图标 */
  icon: string;
  /** 数据来源标记 */
  source?: 'mock' | 'user';
}
```

**导出 JSON 结构**：
```ts
interface IToolboxExport {
  /** 数据结构版本号 */
  schemaVersion: string;
  /** 导出时间 ISO 字符串 */
  exportedAt: string;
  /** 工具数组 */
  tools: ITool[];
  /** 分类数组 */
  categories: ICategory[];
}

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free —— 用户提供完整功能与视觉规范描述，无参考图，按需求语义自主建立设计系统
- **核心情绪 / 应用类型**: 极简清爽的工具集合平台，让用户快速找到并使用小工具，不被视觉干扰
- **独特记忆点**: 工具卡片以 emoji 图标为视觉锚点，搭配极细边框与轻柔阴影，在浅灰护眼背景上形成"工作台"般的秩序感

## 2. Art Direction

- **方向名**: 清爽工作台
- **Design Style**: Swiss Minimalist 瑞士极简 + Soft Blocks 柔色块 —— 适配工具类产品的高效浏览与低干扰使用，同时保持友好不冰冷
- **DNA 参数**: 圆角 12px (soft) / 阴影 subtle (0 1px 3px rgba(0,0,0,0.04)) / 间距 standard (基准 8px，卡片 16px 内边距) / 字体方向 无衬线清晰中性 / 装饰手法 极细边框 + 纯色 emoji 图标
- **应用类型**: Tool (Explore + Operate 双模式) —— 首页网格浏览，详情页聚焦操作

## 3. Color System

**色彩关系**: 清爽蓝主色 + 同色系浅蓝反馈底 + 极浅灰护眼背景 + 纯白卡片承载面
**配色设计理由**: 主色 #3B82F6 承担主按钮、链接和选中态，传递可靠与效率；极浅灰背景 #F8FAFC 护眼不刺眼；纯白卡片提升内容承载感；深灰文字 #1E293B 保持高对比可读，避免纯黑的生硬
**主色推导**: 从用户指定的清爽蓝 #3B82F6 出发，通过降低饱和度、提升明度衍生 accent 浅蓝底；通过统一色温衍生语义色，保持整体协调
**使用比例**: 60% 中性（bg + card + border）/ 30% 辅助（accent + textMuted）/ 10% primary；primary 仅用于主按钮、链接、选中态，不用于 icon 默认态、边框或 tab 底色

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(210 40% 98%) | 页面极浅灰背景，护眼非纯白 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 纯白卡片、表单、弹层承载面 |
| text | `--foreground` | `text-foreground` | hsl(217 33% 17%) | 标题与正文深灰，非纯黑 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 16% 47%) | 说明文字、占位符、辅助信息 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(217 91% 60%) | 主交互、CTA、激活态、链接 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | primary 上的白色文字 |
| accent | `--accent` | `bg-accent` | hsl(214 100% 95%) | hover/focus 浅底、选中浅底、骨架屏 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(217 33% 17%) | accent 上的深灰文字 |
| border | `--border` | `border-border` | hsl(214 32% 91%) | 卡片边框、输入框边框、分割线 |

**语义色提示**: 成功 hsl(160 84% 39%) —— bg: hsl(160 84% 95%) / border: hsl(160 70% 80%) / text: hsl(160 84% 30%)；警告 hsl(38 92% 50%) —— bg: hsl(38 92% 95%) / border: hsl(38 80% 80%) / text: hsl(38 92% 35%)；错误 hsl(0 84% 60%) —— bg: hsl(0 84% 96%) / border: hsl(0 70% 85%) / text: hsl(0 84% 45%)；三者饱和度与 primary 对齐在 80-92% 区间，色温从冷到暖自然分布，不突兀

## 4. 字体与节奏

- **font-display**: Noto Sans SC, system-ui, sans-serif —— 中文标题清晰中性，工具类产品强调可读性与效率
- **font-body**: Noto Sans SC, system-ui, sans-serif —— 正文与界面文字统一使用无衬线，保持简洁克制
- **字号**: H1 24px (text-2xl) 600 行高 1.3；H2 18px (text-lg) 600 行高 1.4；H3 16px (text-base) 500 行高 1.5；body 14px (text-sm) 400 行高 1.6；辅助 12px (text-xs) 400 行高 1.5
- **圆角**: 中 (12px 卡片 / 8px 按钮) —— 足够友好但不幼稚，适配工具产品的专业亲切感

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导；首页顶部导航 + 搜索筛选 + 卡片网格，详情页返回头 + 操作区 + 说明区，管理页表单 + 列表
- **Page / Section Order**: 三视图结构：home（工具广场）/ tool-detail（工具详情）/ manage（工具管理），由底部导航（移动端）或顶部导航（桌面端）切换
- **Standard Content Zone**: Tool 型 max-w-6xl + `mx-auto`；首页网格与管理页列表受此约束，工具详情操作区可根据工具类型局部放宽
- **Shell / Frame Alignment**: 同宽 —— 内容容器与导航框架共享同一 max-width 与左右 padding 节奏
- **Padding & Rhythm**: `px-4 md:px-6 lg:px-8 py-6 md:py-8`；卡片间距 gap-3（12px），模块间距 24px，保持 4/8px 基准倍数
- **Full-bleed Zones**: 顶部导航栏与移动端底部导航栏全宽；短期存储提示条全宽；内容区仍受 Standard Content Zone 约束
- **Local Narrowing**: 管理页表单可收窄至 max-w-xl 居中；工具详情操作区视工具类型决定宽度
- **Overflow Strategy**: 分类标签横向滚动 `overflow-x-auto`；管理页工具列表在窄屏允许横向滚动
- **Flexibility Boundary**: 允许移动端卡片内边距从 16px 微调至 14px，按钮高度 ≥44px；不允许改变主色、圆角体系、阴影语言和间距基准

## 6. 视觉与动效

- **装饰**: emoji 图标 + 极细描边卡片
- **阴影/边界**: 轻 —— 卡片 1px 边框 + 0 1px 3px 柔和阴影；hover 时上移 1-2px，阴影略加深
- **动效**: 克制 —— 过渡时长 150-200ms，ease-out；卡片 hover、页面切换淡入、模态框滑入；严格尊重 `prefers-reduced-motion`

## 7. 组件原则

- 按钮、输入框、卡片、菜单项必须具备 Default / Hover / Active / Focus-visible / Disabled 五种状态
- Primary 按钮蓝色填充，仅用于「立即使用」「保存」等主行动；次按钮浅灰填充 `bg-slate-100`
- 分类标签默认浅灰底深灰字，选中态用 accent 浅蓝底 + primary 文字，不用实心蓝底
- 工具卡片默认白底 + 1px 边框 + 极轻阴影；hover 时 `translate-y-[-2px]` + 阴影加深 + 边框色略深
- 空状态、加载态、错误态延续同一视觉语言，用 emoji 或简约图标 + 中性色文案，不引入额外装饰

## 8. Image Direction

- **Image Role**: 无强制图片需求，优先通过 emoji 图标、排版色彩和卡片秩序建立视觉记忆点
- **Image Art Direction**: 无
- **Image Prompt Keywords**: 无
- **Image Avoidance**: 避免通用科技感插图、商务素材图库感、无主题抽象渐变图

## 9. Anti-patterns

- **纯白黑字回退**: 页面背景变成纯白、文字变成纯黑，失去护眼层次感；bg 必须是 hsl(210 40% 98%) 极浅灰
- **主色泛滥**: 主按钮、tab、icon、边框、链接全用 primary 蓝；严格按 60-30-10 比例，primary 只给 CTA 和选中态文字
- **直角卡片**: 卡片和按钮出现直角或 4px 以下小圆角；统一 12px 卡片圆角、8px 按钮圆角
- **重阴影**: 卡片用浓重黑色投影或多层模糊阴影；只保留 1px 边框 + 0 1px 3px 极轻阴影
- **间距混乱**: 卡片间距、模块间距不统一；以 4/8px 为基准，卡片间距 12px，模块间距 24px
- **无焦点态**: 只做了 hover 没做 focus-visible；所有可交互元素必须有清晰的键盘焦点环（accent 色或 2px outline）
- **状态色刺眼**: 成功/警告/错误色饱和度过高，与整体克制的蓝灰系统脱节；语义色饱和度与 primary 对齐在 80-92%