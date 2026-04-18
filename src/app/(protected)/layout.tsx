import { ChatShell } from "@/components/chat/chat-shell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatShell>{children}</ChatShell>;
}
