import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Toaster } from '@/components/ui/sonner';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
      <Toaster richColors closeButton position="top-center" />
    </div>
  );
};
