import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToolboxStore } from '@/hooks/use-toolbox-store';
import ImportExportBar from '@/components/ImportExportBar';
import ToolIcon from '@/components/ToolIcon';
import type { ITool } from '@/data/topbar';

export default function HomePage() {
  const { tools, categories, exportData, importData, getCategoryIcon, getCategoryName } = useToolboxStore();
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const sortedTools = useMemo(() => [...tools].sort((a, b) => a.sortOrder - b.sortOrder), [tools]);

  const filteredTools = useMemo(() => {
    return sortedTools.filter(tool => {
      const matchCategory = activeCategory === 'all' || tool.category === activeCategory || tool.category === getCategoryName(activeCategory);
      const matchKeyword = !keyword ||
        tool.name.toLowerCase().includes(keyword.toLowerCase()) ||
        tool.description.toLowerCase().includes(keyword.toLowerCase());
      return matchCategory && matchKeyword;
    });
  }, [sortedTools, activeCategory, keyword, getCategoryName]);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* Header + Search */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground">工具广场</h1>
              <p className="text-sm text-muted-foreground mt-1">精选实用小工具，一键即用</p>
            </div>
            <div className="hidden md:block">
              <ImportExportBar onExport={exportData} onImport={importData} />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="搜索工具名称或描述..."
              className="pl-9 h-11 bg-card"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              <ToolIcon icon="logos/cd7289593d6e2da3-yellow-boxfish.webp" className="size-4 object-contain" />
              <span>全部</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.name || activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                <ToolIcon icon={cat.icon} className="size-4 object-contain" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Desktop count */}
          <p className="hidden md:block text-sm text-muted-foreground">共 {filteredTools.length} 个工具</p>
        </section>

        {/* Tool Grid */}
        <section>
          {filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                <ToolIcon icon="logos/865a063f547ade14-gecko-7.webp" className="size-10 object-contain" />
              </div>
              <h3 className="text-base font-medium text-foreground">未找到匹配的工具</h3>
              <p className="text-sm text-muted-foreground mt-1">试试其他关键词或分类</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredTools.map((tool, idx) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  index={idx}
                  onOpen={() => {
                    if (tool.type === 'external' && tool.url) {
                      window.open(tool.url, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(`/tool/${tool.id}`);
                    }
                  }}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          )}
        </section>

        {/* Stats + Import/Export (mobile) */}
        <section className="md:hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              共 {filteredTools.length} 个工具
            </p>
            <ImportExportBar onExport={exportData} onImport={importData} />
          </div>
        </section>

      </main>
    </div>
  );
}

function ToolCard({ tool, index, onOpen, getCategoryIcon }: { tool: ITool; index: number; onOpen: () => void; getCategoryIcon: (name: string) => string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reduce ? { duration: 0 } : { duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduce ? undefined : { y: -2 }}
    >
      <Card
        className="h-full cursor-pointer group transition-shadow hover:shadow-md border-border"
        onClick={onOpen}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="size-11 shrink-0 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">
              <ToolIcon icon={tool.icon} className="size-full object-contain rounded-md" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-foreground truncate">{tool.name}</h3>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="text-xs font-normal px-1.5 py-0 h-5">
                  <ToolIcon icon={getCategoryIcon(tool.category)} className="size-3.5 object-contain" />
                  <span className="truncate">{tool.category}</span>
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.8em]">
            {tool.description}
          </p>
          <Button size="sm" className="w-full gap-1 group-hover:gap-2 transition-all">
            {tool.type === 'external' ? '打开链接' : '立即使用'}
            <ArrowRight className="size-3.5" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
