import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToolboxStore } from '@/hooks/use-toolbox-store';
import ToolIcon from '@/components/ToolIcon';

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tools, getToolById, getCategoryIcon } = useToolboxStore();

  const tool = id ? getToolById(id) : undefined;

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="size-4 mr-2" />
            返回
          </Button>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="size-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium text-foreground">工具不存在</h2>
            <p className="text-sm text-muted-foreground mt-1">该工具可能已被删除或 ID 无效</p>
            <Button className="mt-6" onClick={() => navigate('/')}>返回工具广场</Button>
          </div>
        </main>
      </div>
    );
  }

  const relatedTools = tools.filter((t) => t.id !== tool.id && t.category === tool.category);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6">
        {/* Back + Tool header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="-ml-2">
            <ArrowLeft className="size-4 mr-2" />
            返回广场
          </Button>
          <Badge variant="outline" className="text-xs">
            <ToolIcon icon={getCategoryIcon(tool.category)} className="size-3.5 object-contain" />
            {tool.category}
          </Badge>
        </div>

        {/* Tool info */}
        <div className="flex items-start gap-4">
          <div className="size-14 md:size-16 shrink-0 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl md:text-4xl">
            <ToolIcon icon={tool.icon} className="size-full object-contain rounded-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">{tool.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
          </div>
        </div>

        {/* Tool operation area */}
        <Card className={tool.type === 'iframe' ? 'min-h-[400px]' : 'min-h-[220px]'}>
          <CardHeader>
            <CardTitle className="text-base">工具操作区</CardTitle>
            <CardDescription>
              {tool.type === 'iframe' ? '嵌入工具页面' : tool.type === 'builtin' ? '内置工具' : tool.type === 'external' ? '外部链接' : '占位工具'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tool.type === 'iframe' && tool.url ? (
              <iframe
                src={tool.url}
                title={tool.name}
                className="w-full min-h-[360px] rounded-lg border border-border"
              />
            ) : tool.type === 'external' && tool.url ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                  <ToolIcon icon={tool.icon} className="size-10 object-contain" />
                </div>
                <h3 className="text-base font-medium text-foreground">外部链接工具</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  此工具将在新标签页中打开外部页面。
                </p>
                <Button className="mt-6" onClick={() => window.open(tool.url, '_blank', 'noopener,noreferrer')}>
                  在新标签页打开
                </Button>
              </div>
            ) : tool.type === 'builtin' ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 text-3xl">
                  <ToolIcon icon={tool.icon} />
                </div>
                <h3 className="text-base font-medium text-foreground">内置工具</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  此工具为内置类型，功能组件将在此区域渲染
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                <ToolIcon icon={tool.icon} className="size-10 object-contain" />
              </div>
                <h3 className="text-base font-medium text-foreground">功能开发中</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  此工具正在开发中，即将上线。你可以在管理页配置为 iframe 或内置类型来接入真实功能。
                </p>
                <Button className="mt-6" onClick={() => navigate('/manage')}>
                  去管理页配置
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">使用说明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {tool.type === 'placeholder' ? (
              <>
                <p>• 此工具目前为占位状态，实际功能待开发接入。</p>
                <p>• 你可以在管理页将工具类型修改为 iframe 类型，并填入工具 URL 来嵌入现有工具页面。</p>
                <p>• 也可以将类型设置为 builtin 或 external，接入前端内置组件或外部链接。</p>
              </>
            ) : tool.type === 'external' ? (
              <>
                <p>• 此工具为外部链接，点击「立即使用」会在新标签页打开目标页面。</p>
                <p>• 数据和操作由外部页面自行管理。</p>
              </>
            ) : tool.type === 'iframe' ? (
              <>
                <p>• 在上方操作区中直接使用嵌入的工具页面。</p>
                <p>• 如遇显示异常，请尝试刷新页面或检查工具 URL 是否可访问。</p>
                <p>• 数据和设置由嵌入页面自行管理。</p>
              </>
            ) : (
              <>
                <p>• 在上方操作区中使用内置工具。</p>
                <p>• 所有操作均在本地完成，数据不会上传。</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* 同类工具：同分类的其他工具，填补留白并提供导航 */}
        {relatedTools.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">同类工具</CardTitle>
              <CardDescription>同属「{tool.category}」的其他工具</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {relatedTools.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => navigate(`/tool/${t.id}`)}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="size-10 shrink-0 rounded-xl bg-muted/50 flex items-center justify-center text-xl overflow-hidden">
                      <ToolIcon icon={t.icon} className="size-full object-contain rounded-md" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.type === 'iframe' ? '嵌入工具' : t.type === 'builtin' ? '内置工具' : t.type === 'external' ? '外部链接' : '占位工具'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
