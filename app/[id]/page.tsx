import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { loadSessionMessages } from "@/lib/chat/messages";
import { ChatHeader } from "@/components/chat-header";

import { Chat } from "./chat";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const initialMessages = await loadSessionMessages({
    sessionId: id,
    nucleusId: userId,
    authId: userId,
  });

  return (
    <div className="relative flex-1 min-h-0">
      <ChatHeader sessionId={id} />
      <Chat key={id} id={id} initialMessages={initialMessages} />
    </div>
  );
}
