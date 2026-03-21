import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarLayout } from "@/components/chat/sidebar-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { stackServerApp } from "@/stack/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <SidebarLayout>{children}</SidebarLayout>
      </SidebarProvider>
    </TooltipProvider>
  );
}
