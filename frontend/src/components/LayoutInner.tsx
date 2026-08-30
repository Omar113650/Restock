"use client";
import { useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import CustomerNav from './CustomerNav';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const publicRoutes = ['/login', '/customer/login'];
  const isPublicRoute = publicRoutes.some(r => pathname.startsWith(r));

  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute) {
        router.push('/login');
      } else if (user && isPublicRoute) {
        router.push(user.role === 'admin' ? '/' : '/shop');
      }
    }
  }, [user, isLoading, isPublicRoute, router]);

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Customer view
  if (user?.role === 'customer') {
    return (
      <div className="flex flex-col h-screen bg-background">
        <CustomerNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    );
  }

  // Admin view
  if (user?.role === 'admin') {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto p-8 relative">{children}</main>
      </div>
    );
  }

  // Public routes (like login) when not logged in
  return <main className="min-h-screen bg-background">{children}</main>;
}
