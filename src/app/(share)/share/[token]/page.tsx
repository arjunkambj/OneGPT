import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { ShareViewer } from "@/components/chat/share-viewer";
import { api } from "../../../../../convex/_generated/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const chat = await fetchQuery(api.chats.getSharedChat, {
    shareToken: token,
  });

  if (!chat) {
    return { title: "Chat not found | OneGPT" };
  }

  return {
    title: chat.title,
    description: "A shared chat on OneGPT",
    openGraph: {
      title: chat.title,
      url: `https://onegpt.sh/share/${token}`,
      description: "A shared chat on OneGPT",
      siteName: "OneGPT",
    },
    twitter: {
      card: "summary",
      title: chat.title,
      description: "A shared chat on OneGPT",
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ShareViewer shareToken={token} />;
}
