import { fetchQuery } from "convex/nextjs";
import { notFound, redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import type { ChatMessage } from "@/lib/types";
import { stackServerApp } from "@/stack/server";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default async function ChatByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await stackServerApp.getUser();
  if (!user) redirect("/sign-in");

  const authJson = await user.getAuthJson();
  const token = authJson.accessToken ?? undefined;
  const chatId = id as Id<"chats">;

  const chat = await fetchQuery(api.chats.getChat, { chatId }, { token });
  if (!chat) notFound();

  const messages = await fetchQuery(
    api.messages.getMessages,
    { chatId },
    { token },
  );

  // Convert Convex docs to ChatMessage format
  const initialMessages: ChatMessage[] = (messages ?? []).map((m) => ({
    id: m._id,
    role: m.role as "user" | "assistant" | "system",
    parts: m.parts as ChatMessage["parts"],
    model: m.model,
    inputTokens: m.inputTokens,
    outputTokens: m.outputTokens,
    totalTokens: m.totalTokens,
    completionTime: m.completionTime,
    createdAt: m.createdAt,
  }));

  return (
    <ChatInterface
      key={id}
      initialChatId={id}
      initialMessages={initialMessages}
    />
  );
}
