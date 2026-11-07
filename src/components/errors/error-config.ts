import type { ReactNode } from 'react';

export type ErrorKind = '403' | '404' | '500' | '502' | '503' | 'network' | 'runtime' | 'api';

export interface ErrorAction {
  label: string;
  to?: string;
  onClick?: () => void;
}

export interface ErrorPageCopy {
  kind: ErrorKind;
  code: string;
  title: string;
  description: string;
  primaryAction: ErrorAction;
  secondaryAction?: ErrorAction;
  eyebrow?: string;
}

export const errorConfig: Record<ErrorKind, ErrorPageCopy> = {
  '403': {
    kind: '403',
    code: '403',
    eyebrow: 'Access denied',
    title: '没有访问权限',
    description: '当前账号暂时不能访问这个页面。',
    primaryAction: { label: '返回首页', to: '/' },
  },
  '404': {
    kind: '404',
    code: '404',
    eyebrow: 'No such page',
    title: '页面没有找到',
    description: '这个页面可能已经被移动、删除，或者地址输入有误。',
    primaryAction: { label: '返回首页', to: '/' },
  },
  '500': {
    kind: '500',
    code: '500',
    eyebrow: 'Something went wrong',
    title: '页面出现了一些问题',
    description: '刚才的操作没有完成，请稍后再试。',
    primaryAction: { label: '重新尝试' },
    secondaryAction: { label: '返回首页', to: '/' },
  },
  '502': {
    kind: '502',
    code: '502',
    eyebrow: 'Bad gateway',
    title: '服务连接异常',
    description: '核心服务暂时没有正确响应。',
    primaryAction: { label: '重新尝试' },
    secondaryAction: { label: '返回首页', to: '/' },
  },
  '503': {
    kind: '503',
    code: '503',
    eyebrow: 'Temporarily unavailable',
    title: '服务暂时不可用',
    description: '服务可能正在维护或过载，请稍后再来。',
    primaryAction: { label: '重新尝试' },
    secondaryAction: { label: '返回首页', to: '/' },
  },
  network: {
    kind: 'network',
    code: 'NET',
    eyebrow: 'Connection lost',
    title: '网络连接失败',
    description: '当前网络不可用，恢复连接后可以继续使用。',
    primaryAction: { label: '重新检查' },
    secondaryAction: { label: '返回首页', to: '/' },
  },
  runtime: {
    kind: 'runtime',
    code: 'ERR',
    eyebrow: 'Runtime exception',
    title: '页面运行异常',
    description: '页面渲染时遇到问题，已隐藏内部错误细节。',
    primaryAction: { label: '重新尝试' },
    secondaryAction: { label: '返回首页', to: '/' },
  },
  api: {
    kind: 'api',
    code: 'LOAD',
    eyebrow: 'Core data failed',
    title: '核心内容加载失败',
    description: '这个页面需要的关键数据没有加载成功。',
    primaryAction: { label: '重新尝试' },
    secondaryAction: { label: '返回首页', to: '/' },
  },
};

export function resolveErrorKind(value: string | undefined): ErrorKind {
  if (!value) return '404';
  if (value === '403' || value === '404' || value === '500' || value === '502' || value === '503') {
    return value;
  }
  if (value === 'network' || value === 'runtime' || value === 'api') return value;
  return '404';
}

export function classifyRequestFailure(error: unknown, status?: number): ErrorKind {
  if (status === 403) return '403';
  if (status === 404) return '404';
  if (status === 502) return '502';
  if (status === 503) return '503';
  if (typeof status === 'number' && status >= 500) return '500';

  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'network';

  const message = error instanceof Error ? error.message.toLowerCase() : String(error ?? '').toLowerCase();
  if (message.includes('timeout') || message.includes('network') || message.includes('failed to fetch')) {
    return 'network';
  }
  return 'api';
}

export interface ErrorStateCopy {
  title: string;
  description: string;
  action?: ReactNode;
}
