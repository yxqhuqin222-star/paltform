import { useState, useMemo } from 'react';
import ToolIcon from '@/components/ToolIcon';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Check, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToolboxStore, type ICategory } from '@/hooks/use-toolbox-store';
import ImportExportBar from '@/components/ImportExportBar';
import type { ITool } from '@/data/topbar';

const toolSchema = z.object({
  name: z.string().min(1, '工具名称不能为空'),
  description: z.string().min(1, '描述不能为空'),
  icon: z.string().min(1, '图标不能为空'),
  category: z.string().min(1, '请选择分类'),
  type: z.enum(['placeholder', 'iframe', 'builtin', 'external']),
  url: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  icon: z.string().min(1, '图标不能为空'),
});

type ToolFormData = z.infer<typeof toolSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;

export default function ManagePage() {
  const {
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
    importData,
    publishToGitHub,
    resetToDefault,
    onlineStateStatus,
  } = useToolboxStore();

  const sortedTools = useMemo(() => [...tools].sort((a, b) => a.sortOrder - b.sortOrder), [tools]);
  const [githubToken, setGithubToken] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    const token = githubToken.trim();
    if (!token) {
      toast.error('请先输入 GitHub Token');
      return;
    }
    setIsPublishing(true);
    try {
      await publishToGitHub(token);
      toast.success('已保存到网站配置，等待 GitHub Pages 更新后全网生效');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存到网站失败');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">工具管理</h1>
            <p className="text-sm text-muted-foreground mt-1">添加、编辑和管理你的工具集合</p>
          </div>
        </div>

        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">工具管理</TabsTrigger>
            <TabsTrigger value="categories">分类管理</TabsTrigger>
            <TabsTrigger value="data">数据管理</TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4 mt-4">
            {/* Add Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  添加新工具
                </CardTitle>
                <CardDescription>填写工具信息后添加到工具广场</CardDescription>
              </CardHeader>
              <CardContent>
                <ToolForm
                  categories={categories}
                  onSubmit={data => {
                    addTool({
                      name: data.name,
                      description: data.description,
                      icon: data.icon,
                      category: data.category,
                      type: data.type,
                      url: data.url,
                    });
                  }}
                  submitLabel="添加工具"
                />
              </CardContent>
            </Card>

            {/* Tool List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">已有工具 ({sortedTools.length})</CardTitle>
                <CardDescription>点击编辑修改，拖拽或上下箭头调整顺序</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                  <AnimatePresence initial={false}>
                    {sortedTools.map((tool, idx) => (
                      <motion.div
                        key={tool.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ToolRow
                          tool={tool}
                          index={idx}
                          total={sortedTools.length}
                          categories={categories}
                          onEdit={data => updateTool(tool.id, data)}
                          onDelete={() => deleteTool(tool.id)}
                          onMoveUp={() => moveTool(tool.id, 'up')}
                          onMoveDown={() => moveTool(tool.id, 'down')}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {sortedTools.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    还没有工具，添加第一个吧
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">添加分类</CardTitle>
                <CardDescription>创建新的工具分类</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryForm
                  onSubmit={data => addCategory(data.name, data.icon)}
                  submitLabel="添加分类"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">分类列表 ({categories.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                  {categories.map(cat => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      onEdit={data => updateCategory(cat.id, data)}
                      onDelete={() => deleteCategory(cat.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">保存到网站</CardTitle>
                <CardDescription>把当前工具和分类写入 GitHub Pages 使用的公共配置文件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="password"
                    value={githubToken}
                    onChange={event => setGithubToken(event.target.value)}
                    placeholder="粘贴有仓库写权限的 GitHub Token"
                    autoComplete="off"
                  />
                  <Button onClick={handlePublish} disabled={isPublishing || !githubToken.trim()} className="gap-1.5">
                    <CloudUpload className="size-4" />
                    {isPublishing ? '保存中...' : '保存到网站'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Token 只用于这次浏览器请求，不会写入代码。保存成功后，GitHub Pages 通常需要几十秒到几分钟更新。
                  当前状态：{onlineStateStatus === 'loaded' ? '已读取网站配置' : onlineStateStatus === 'saved' ? '已提交保存' : onlineStateStatus === 'saving' ? '正在保存' : onlineStateStatus === 'local-only' ? '使用本地配置' : onlineStateStatus === 'error' ? '保存失败' : '读取中'}。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">导入导出</CardTitle>
                <CardDescription>将工具配置导出为 JSON 文件，或从文件导入</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImportExportBar
                  onExport={exportData}
                  onImport={importData}
                  onReset={resetToDefault}
                  showReset
                />
                <p className="text-xs text-muted-foreground">
                  导出格式包含 schemaVersion、导出时间、tools 数组、categories 数组。
                  导入时可选择覆盖（完全替换）或合并（仅新增不重复项）。
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive">危险操作</CardTitle>
                <CardDescription>清空所有数据并恢复默认示例</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">清空全部数据并恢复默认</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认清空？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将清除所有自定义工具和分类，恢复为初始的 6 个示例工具和 2 个分类。
                        建议先导出备份。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={resetToDefault}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        确认清空
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ToolForm({
  categories,
  onSubmit,
  submitLabel,
  initialValues,
  onCancel,
}: {
  categories: ICategory[];
  onSubmit: (data: ToolFormData) => void;
  submitLabel: string;
  initialValues?: Partial<ToolFormData>;
  onCancel?: () => void;
}) {
  const form = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      icon: initialValues?.icon ?? 'logos/524c027263023ec5-conga-drum.webp',
      category: initialValues?.category ?? (categories[0]?.name ?? ''),
      type: initialValues?.type ?? 'placeholder',
      url: initialValues?.url ?? '',
    },
  });

  const toolType = form.watch('type');

  const handleSubmit = (data: ToolFormData) => {
    onSubmit(data);
    if (!initialValues) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>工具名称 <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="例如：单位换算器" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>图标（图片路径或 emoji） <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="logos/524c027263023ec5-conga-drum.webp" {...field} className="text-lg" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>一句话描述 <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input placeholder="长度、重量、温度等常用单位换算" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类 <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        <ToolIcon icon={cat.icon} className="size-4 object-contain" /><span>{cat.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>工具类型 <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="选择类型" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="placeholder">占位（开发中）</SelectItem>
                    <SelectItem value="iframe">iframe 嵌入</SelectItem>
                    <SelectItem value="builtin">内置工具</SelectItem>
                    <SelectItem value="external">外部链接</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {(toolType === 'iframe' || toolType === 'external') && (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>工具 URL <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="https://example.com/tool" type="url" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="gap-1.5">
            {initialValues ? <Check className="size-4" /> : <Plus className="size-4" />}
            {submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

function ToolRow({
  tool,
  index,
  total,
  categories,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  tool: ITool;
  index: number;
  total: number;
  categories: ICategory[];
  onEdit: (data: Partial<ITool>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors">
      <div className="size-10 shrink-0 rounded-lg bg-muted/50 flex items-center justify-center text-xl">
        <ToolIcon icon={tool.icon} className="size-5 object-contain rounded-md" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground truncate">{tool.name}</span>
          <Badge variant="outline" className="text-xs font-normal px-1.5 py-0 h-5">
            {tool.category}
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal px-1.5 py-0 h-5">
            {tool.type === 'placeholder' ? '占位' : tool.type === 'iframe' ? 'iframe' : tool.type === 'external' ? '外链' : '内置'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-0.5">{tool.description}</p>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={index === 0} aria-label="上移">
          <ChevronUp className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={index === total - 1} aria-label="下移">
          <ChevronDown className="size-4" />
        </Button>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="编辑">
              <Pencil className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑工具</DialogTitle>
            </DialogHeader>
            <ToolForm
              categories={categories}
              initialValues={{
                name: tool.name,
                description: tool.description,
                icon: tool.icon,
                category: tool.category,
                type: tool.type,
                url: tool.url,
              }}
              submitLabel="保存修改"
              onSubmit={data => {
                onEdit(data);
                setEditOpen(false);
              }}
              onCancel={() => setEditOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="删除" className="text-destructive hover:text-destructive">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>删除工具「{tool.name}」？</AlertDialogTitle>
              <AlertDialogDescription>
                删除后无法恢复，确定要删除这个工具吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function CategoryForm({
  onSubmit,
  submitLabel,
  initialValues,
  onCancel,
}: {
  onSubmit: (data: CategoryFormData) => void;
  submitLabel: string;
  initialValues?: Partial<CategoryFormData>;
  onCancel?: () => void;
}) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      icon: initialValues?.icon ?? 'logos/513d096f5388cb9a-waffle-iron.webp',
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit(data);
    if (!initialValues) form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类名称 <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="例如：实用工具" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>图标（图片路径或 emoji） <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="logos/513d096f5388cb9a-waffle-iron.webp" {...field} className="text-lg" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="gap-1.5">
            {initialValues ? <Check className="size-4" /> : <Plus className="size-4" />}
            {submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: ICategory;
  onEdit: (data: Partial<ICategory>) => void;
  onDelete: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors">
      <div className="size-10 shrink-0 rounded-lg bg-muted/50 flex items-center justify-center text-xl">
        <ToolIcon icon={category.icon} className="size-4 object-contain rounded-md" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-foreground">{category.name}</span>
        {category.source === 'mock' && (
          <Badge variant="outline" className="ml-2 text-xs font-normal px-1.5 py-0 h-5">
            默认
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="编辑">
              <Pencil className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑分类</DialogTitle>
            </DialogHeader>
            <CategoryForm
              initialValues={{ name: category.name, icon: category.icon }}
              submitLabel="保存修改"
              onSubmit={data => {
                onEdit(data);
                setEditOpen(false);
              }}
              onCancel={() => setEditOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="删除" className="text-destructive hover:text-destructive">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>删除分类「{category.name}」？</AlertDialogTitle>
              <AlertDialogDescription>
                删除分类不会删除已有工具，但工具可能无法在该分类下显示。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
