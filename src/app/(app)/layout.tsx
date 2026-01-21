import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { MainSidebar } from '@/components/main-sidebar';
import { BottomNav } from '@/components/bottom-nav';
import { AppProvider } from '@/context/AppContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <SidebarProvider>
        <MainSidebar />
        <SidebarInset>
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex flex-1 flex-col gap-4 bg-background p-4 pb-20 md:pb-4 lg:gap-6 lg:p-6">
              {children}
            </main>
            <BottomNav />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  );
}
