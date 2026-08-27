import { useState, useRef } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import type { ToolboxExport } from '@/hooks/use-toolbox-store';

interface ImportExportBarProps {
  onExport: () => ToolboxExport;
  onImport: (data: ToolboxExport, mode: 'merge' | 'replace') => void;
  onReset?: () => void;
  showReset?: boolean;
}

export default function ImportExportBar({ onExport, onImport, onReset, showReset = false }: ImportExportBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{ data: ToolboxExport; toolsCount: number; categoriesCount: number } | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('replace');

  const handleExport = () => {
    try {
      const data = onExport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolbox-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('导出成功');
    } catch (e) {
      logger.error('Export failed:', String(e));
      toast.error('导出失败');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ToolboxExport;
        if (!Array.isArray(data.tools) || !Array.isArray(data.categories)) {
          throw new Error('数据结构不完整');
        }
        setImportPreview({
          data,
          toolsCount: data.tools.length,
          categoriesCount: data.categories.length,
        });
        setImportOpen(true);
      } catch (err) {
        logger.error('Import parse failed:', String(err));
        toast.error('文件格式无效，请检查 JSON 结构');
      }
    };
    reader.onerror = () => {
      toast.error('文件读取失败');
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    onImport(importPreview.data, importMode);
    toast.success(
      importMode === 'replace'
        ? `已导入 ${importPreview.toolsCount} 个工具、${importPreview.categoriesCount} 个分类`
        : `已合并导入 ${importPreview.toolsCount} 个工具、${importPreview.categoriesCount} 个分类`
    );
    setImportOpen(false);
    setImportPreview(null);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      toast.success('已恢复默认数据');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
        <Download className="size-4" />
        导出
      </Button>
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
        <Upload className="size-4" />
        导入
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />
      {showReset && onReset && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
              <Trash2 className="size-4" />
              清空恢复
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认清空并恢复默认？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作将清除所有自定义工具和分类，恢复为初始示例数据。建议先导出备份。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
                确认清空
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入数据</DialogTitle>
            <DialogDescription>
              检测到文件中包含以下数据，请选择导入方式：
            </DialogDescription>
          </DialogHeader>
          {importPreview && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Badge variant="secondary" className="text-sm">
                  工具：{importPreview.toolsCount} 个
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  分类：{importPreview.categoriesCount} 个
                </Badge>
              </div>
              <div className="flex gap-3">
                <Button
                  variant={importMode === 'replace' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImportMode('replace')}
                  className="flex-1"
                >
                  覆盖导入
                </Button>
                <Button
                  variant={importMode === 'merge' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImportMode('merge')}
                  className="flex-1"
                >
                  合并导入
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {importMode === 'replace'
                  ? '覆盖导入：将完全替换当前数据'
                  : '合并导入：仅新增 ID 不重复的项目'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmImport}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
