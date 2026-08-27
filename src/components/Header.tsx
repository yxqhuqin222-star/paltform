import { NavLink } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';
import { ToolIcon } from '@/components/ToolIcon';

const NAV_ITEMS = [
  { path: '/', label: '工具广场', icon: Home },
  { path: '/manage', label: '管理', icon: Settings },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 hidden md:block">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
            <ToolIcon icon="logos/362d525a9757285f-rainbow-radar.webp" className="size-5 object-contain" />
          </div>
          <span className="text-base font-semibold text-foreground">工具广场</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`
                }
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
