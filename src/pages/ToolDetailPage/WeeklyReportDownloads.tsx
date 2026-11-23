import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Report {
  date: string;
  version: string;
}

export default function WeeklyReportDownloads() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('./weekly-reports/index.json', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('周报列表不可用');
        const data = await response.json() as { reports: Report[] };
        setReports(data.reports);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">已发布周报</CardTitle></CardHeader>
      <CardContent>
        {failed && <p role="status" className="text-sm text-muted-foreground">暂时无法加载周报列表。</p>}
        {!failed && !reports && <p role="status" className="text-sm text-muted-foreground">正在读取周报…</p>}
        {reports?.length === 0 && <p className="text-sm text-muted-foreground">暂无已发布周报。</p>}
        <ul className="divide-y">
          {reports?.map(({ date, version }) => (
            <li key={date} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm">
              <time dateTime={date} className="font-medium">{date}</time>
              <a className="text-primary underline underline-offset-4" href={`./weekly-reports/${date}.xlsx?v=${version}`} download>下载 Excel</a>
              <a className="text-primary underline underline-offset-4" href={`./weekly-reports/${date}.zip?v=${version}`} download>下载四张图片</a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
