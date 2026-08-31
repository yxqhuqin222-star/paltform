# 小工具集合平台

一个 React + TypeScript 的个人工具广场，用来集中展示和管理常用小工具。

当前公开版本通过 GitHub Pages 提供静态页面：

https://yxqhuqin222-star.github.io/paltform/#/

## 当前能力

- 首页「工具广场」展示工具卡片，支持按工具名称或描述搜索。
- 支持按分类筛选工具，当前默认分类包括「实用工具」和「文字处理」。
- 工具卡片支持三类入口：占位工具、内置或详情页工具、外部链接工具。
- 当前内置示例工具里，「人效成本监控」会打开外部 GitHub Pages 页面：https://yxqhuqin222-star.github.io/renxiao/。
- 工具管理页支持添加、编辑、删除工具，创建或删除分类，并支持导入、导出工具配置 JSON。
- 路由使用 HashRouter，适合部署在 GitHub Pages 这类子路径静态托管环境。

## 公开页面文件

GitHub Pages 使用 main 分支的 docs/ 目录：

    docs/
    index.html
    routes.json
    assets/
    logos/
    favicon.svg
    icons.svg

docs/index.html 当前加载相对路径资源，便于在 https://yxqhuqin222-star.github.io/paltform/ 下运行。

## 本地开发

    npm install
    npm run dev

常用检查：

    npm run build
    npm run typecheck

## 目录结构

    src/
      index.tsx      React 入口，包含 HashRouter
      app.tsx        路由配置
      components/    通用组件和基础 UI 组件
      data/topbar.ts 默认工具清单
      hooks/         工具状态、导入导出等 hooks
      pages/         HomePage、ToolDetailPage、ManagePage、NotFoundPage

    shared/static/   平台私有源资源说明，不作为公开匿名资源目录
    public/          公开静态资源
    docs/            GitHub Pages 静态产物
    scripts/         构建、token 替换和旧地址迁移脚本

## 部署说明

本项目的公开静态页面以 GitHub Pages 为主，不在本 README 中执行部署。

如果需要重新生成 docs/：

    npm run build

旧 CloudBase 路径 /app/paltform 只保留迁移提示页用途。scripts/deploy-cloudbase.sh 会生成一个提示用户跳转到 GitHub Pages 新地址的页面，并部署到 CloudBase 子路径；运行该脚本会修改外部 CloudBase 状态，执行前需要单独确认。

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui 风格基础组件
- lucide-react
- framer-motion
- react-router-dom
