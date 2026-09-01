import { useState, useEffect, useCallback } from 'react';
import { scopedStorage, logger } from '@lark-apaas/client-toolkit-lite';
import { type ITool, MOCK_TOOLS } from '@/data/topbar';

export interface ICategory {
  id: string;
  name: string;
  icon: string;
  source?: 'mock' | 'user';
}

const TOOLS_KEY = '__toolbox_tools';
const CATEGORIES_KEY = '__toolbox_categories';
const VERSION_KEY = '__toolbox_defaults_version';
const DEFAULTS_VERSION = '20240823-4';
const GITHUB_OWNER = 'yxqhuqin222-star';
const GITHUB_REPO = 'paltform';
const GITHUB_BRANCH = 'main';
const GITHUB_STATE_PATHS = ['docs/toolbox-state.json', 'public/toolbox-state.json'];

const DEFAULT_CATEGORIES: ICategory[] = [
  { id: 'cat-1', name: '实用工具', icon: 'logos/de49f5b20bacdb1a-rubber-mallet.webp', source: 'mock' },
  { id: 'cat-2', name: '文字处理', icon: 'logos/b8825dec2a4b3eb6-maltese.webp', source: 'mock' },
];

export interface ToolboxExport {
  schemaVersion: string;
  exportedAt: string;
  tools: ITool[];
  categories: ICategory[];
}

interface StoredState {
  tools: ITool[];
  categories: ICategory[];
  version: string;
  hasStoredState: boolean;
}

export type OnlineStateStatus = 'loading' | 'loaded' | 'local-only' | 'saving' | 'saved' | 'error';

function loadStoredState(): StoredState {
  try {
    const toolsRaw = scopedStorage.getItem(TOOLS_KEY);
    const categoriesRaw = scopedStorage.getItem(CATEGORIES_KEY);
    const versionRaw = scopedStorage.getItem(VERSION_KEY);

    const storedTools = toolsRaw ? (JSON.parse(toolsRaw) as ITool[]) : [];
    const storedCategories = categoriesRaw ? (JSON.parse(categoriesRaw) as ICategory[]) : [];
    const storedVersion = versionRaw ?? '0';
    const hasStoredState = Boolean(toolsRaw || categoriesRaw);

    if (!Array.isArray(storedTools) || !Array.isArray(storedCategories)) {
      return { tools: [...MOCK_TOOLS], categories: [...DEFAULT_CATEGORIES], version: DEFAULTS_VERSION, hasStoredState };
    }

    if (storedVersion === DEFAULTS_VERSION) {
      return { tools: storedTools, categories: storedCategories, version: storedVersion, hasStoredState };
    }

    // 默认数据版本已升级：替换所有内置 mock 项，保留用户新增项
    const mockToolIds = new Set(MOCK_TOOLS.map(t => t.id));
    const mockCatIds = new Set(DEFAULT_CATEGORIES.map(c => c.id));

    const mergedTools = [
      ...storedTools.filter(t => !mockToolIds.has(t.id)),
      ...MOCK_TOOLS,
    ];
    const mergedCategories = [
      ...storedCategories.filter(c => !mockCatIds.has(c.id)),
      ...DEFAULT_CATEGORIES,
    ];

    return { tools: mergedTools, categories: mergedCategories, version: DEFAULTS_VERSION, hasStoredState };
  } catch (e) {
    logger.error('Failed to load toolbox state:', String(e));
    return { tools: [...MOCK_TOOLS], categories: [...DEFAULT_CATEGORIES], version: DEFAULTS_VERSION, hasStoredState: false };
  }
}

function saveStoredState(tools: ITool[], categories: ICategory[]) {
  try {
    scopedStorage.setItem(TOOLS_KEY, JSON.stringify(tools));
    scopedStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    scopedStorage.setItem(VERSION_KEY, DEFAULTS_VERSION);
  } catch (e) {
    logger.error('Failed to save toolbox state:', String(e));
  }
}

function validateState(data: unknown): data is ToolboxExport {
  if (!data || typeof data !== 'object') return false;
  const state = data as Partial<ToolboxExport>;
  return Array.isArray(state.tools) && Array.isArray(state.categories);
}

function getPublicStateUrl() {
  return new URL('toolbox-state.json', window.location.href.split('#')[0]).toString();
}

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function loadPublicState() {
  const response = await fetch(getPublicStateUrl(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`读取网站配置失败：${response.status}`);
  }
  const data = await response.json();
  if (!validateState(data)) {
    throw new Error('网站配置格式不完整');
  }
  return data;
}

async function saveGitHubFile(path: string, data: ToolboxExport, token: string) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const currentResponse = await fetch(`${url}?ref=${GITHUB_BRANCH}`, { headers });
  let sha: string | undefined;
  if (currentResponse.ok) {
    const current = await currentResponse.json() as { sha?: string };
    sha = current.sha;
  } else if (currentResponse.status !== 404) {
    const error = await currentResponse.json().catch(() => null) as { message?: string } | null;
    throw new Error(error?.message ?? `读取 GitHub 文件失败：${currentResponse.status}`);
  }

  const nextState = {
    ...data,
    exportedAt: new Date().toISOString(),
  };
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'chore: update toolbox state',
      branch: GITHUB_BRANCH,
      sha,
      content: toBase64(JSON.stringify(nextState, null, 2)),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(error?.message ?? `保存到 GitHub 失败：${response.status}`);
  }
}

async function saveGitHubState(data: ToolboxExport, token: string) {
  for (const path of GITHUB_STATE_PATHS) {
    await saveGitHubFile(path, data, token);
  }
}

export function useToolboxStore() {
  const initial = loadStoredState();
  const [tools, setTools] = useState<ITool[]>(initial.tools);
  const [categories, setCategories] = useState<ICategory[]>(initial.categories);
  const [onlineStateStatus, setOnlineStateStatus] = useState<OnlineStateStatus>('loading');

  useEffect(() => {
    if (!initial.hasStoredState && onlineStateStatus === 'loading') return;
    saveStoredState(tools, categories);
  }, [tools, categories, onlineStateStatus]);

  useEffect(() => {
    if (initial.hasStoredState) {
      setOnlineStateStatus('local-only');
      return;
    }
    let cancelled = false;
    loadPublicState()
      .then(data => {
        if (cancelled) return;
        setTools(data.tools);
        setCategories(data.categories);
        setOnlineStateStatus('loaded');
      })
      .catch(error => {
        if (cancelled) return;
        logger.warn('Public toolbox state unavailable, using local state:', String(error));
        setOnlineStateStatus('local-only');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addTool = useCallback((tool: Omit<ITool, 'id' | 'createdAt' | 'sortOrder' | 'source'> & { sortOrder?: number }) => {
    setTools(prev => {
      const newTool: ITool = {
        ...tool,
        id: `tool-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        sortOrder: tool.sortOrder ?? prev.length + 1,
        source: 'user',
      };
      return [...prev, newTool];
    });
  }, []);

  const updateTool = useCallback((id: string, updates: Partial<ITool>) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTool = useCallback((id: string) => {
    setTools(prev => prev.filter(t => t.id !== id));
  }, []);

  const moveTool = useCallback((id: string, direction: 'up' | 'down') => {
    setTools(prev => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sorted.findIndex(t => t.id === id);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === sorted.length - 1) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      const temp = sorted[idx].sortOrder;
      sorted[idx] = { ...sorted[idx], sortOrder: sorted[swapIdx].sortOrder };
      sorted[swapIdx] = { ...sorted[swapIdx], sortOrder: temp };
      return sorted;
    });
  }, []);

  const addCategory = useCallback((name: string, icon: string) => {
    setCategories(prev => [
      ...prev,
      { id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, icon, source: 'user' },
    ]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<ICategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const exportData = useCallback((): ToolboxExport => {
    return {
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      tools,
      categories,
    };
  }, [tools, categories]);

  const publishToGitHub = useCallback(async (token: string) => {
    setOnlineStateStatus('saving');
    try {
      await saveGitHubState(exportData(), token.trim());
      setOnlineStateStatus('saved');
    } catch (error) {
      setOnlineStateStatus('error');
      throw error;
    }
  }, [exportData]);

  const validateImport = useCallback((data: unknown): { valid: boolean; toolsCount: number; categoriesCount: number; error?: string } => {
    if (!data || typeof data !== 'object') {
      return { valid: false, toolsCount: 0, categoriesCount: 0, error: '数据格式无效' };
    }
    const obj = data as Record<string, unknown>;
    if (!Array.isArray(obj.tools)) {
      return { valid: false, toolsCount: 0, categoriesCount: 0, error: '缺少 tools 数组' };
    }
    if (!Array.isArray(obj.categories)) {
      return { valid: false, toolsCount: 0, categoriesCount: 0, error: '缺少 categories 数组' };
    }
    return {
      valid: true,
      toolsCount: obj.tools.length,
      categoriesCount: obj.categories.length,
    };
  }, []);

  const importData = useCallback((data: ToolboxExport, mode: 'merge' | 'replace' = 'replace') => {
    if (mode === 'replace') {
      setTools(data.tools);
      setCategories(data.categories);
    } else {
      setTools(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newTools = data.tools.filter(t => !existingIds.has(t.id));
        return [...prev, ...newTools];
      });
      setCategories(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newCats = data.categories.filter(c => !existingIds.has(c.id));
        return [...prev, ...newCats];
      });
    }
  }, []);

  const resetToDefault = useCallback(() => {
    setTools([...MOCK_TOOLS]);
    setCategories([...DEFAULT_CATEGORIES]);
  }, []);

  const getToolById = useCallback((id: string) => {
    return tools.find(t => t.id === id);
  }, [tools]);

  const getCategoryName = useCallback((categoryIdOrName: string) => {
    const cat = categories.find(c => c.id === categoryIdOrName || c.name === categoryIdOrName);
    return cat?.name ?? categoryIdOrName;
  }, [categories]);

  const getCategoryIcon = useCallback((categoryIdOrName: string) => {
    const cat = categories.find(c => c.id === categoryIdOrName || c.name === categoryIdOrName);
    return cat?.icon ?? 'logos/66c9edf49ce30c23-snowball-yeti-2.webp';
  }, [categories]);

  return {
    tools,
    categories,
    addTool,
    updateTool,
    deleteTool,
    moveTool,
    addCategory,
    updateCategory,
    deleteCategory,
    exportData,
    validateImport,
    importData,
    publishToGitHub,
    resetToDefault,
    getToolById,
    getCategoryName,
    getCategoryIcon,
    onlineStateStatus,
  };
}
