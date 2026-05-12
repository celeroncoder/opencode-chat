import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { loadSessionMessages } from "@/lib/chat/messages";

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

  return <Chat key={id} id={id} initialMessages={initialMessages} />;
}
