import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { stackServerApp } from "@/stack/server";

export default async function NewChatPage() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  return <ChatInterface key="new-chat" />;
}
