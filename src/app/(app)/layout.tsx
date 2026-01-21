import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { MainSidebar } from '@/components/main-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
