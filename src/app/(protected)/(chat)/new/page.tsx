import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { hexclaveServerApp } from "@/hexclave/server";

export default async function NewChatPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  return <ChatInterface key="new-chat" />;
}
