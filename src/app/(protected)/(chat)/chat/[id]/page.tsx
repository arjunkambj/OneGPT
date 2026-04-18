import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { stackServerApp } from "@/stack/server";

export default async function ChatByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  return <ChatInterface key={id} initialChatId={id} />;
}
