import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarLayout } from '@/components/chat/sidebar-layout';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SidebarLayout>{children}</SidebarLayout>
      </SidebarProvider>
    </TooltipProvider>
  );
}
