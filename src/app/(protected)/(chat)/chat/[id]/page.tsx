import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { hexclaveServerApp } from "@/hexclave/server";

export default async function ChatByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  return <ChatInterface key={id} initialChatId={id} />;
}
