import { ChatInterface } from "@/components/chat/chat-interface";

export default async function ChatByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatInterface key={id} initialChatId={id} />;
}
