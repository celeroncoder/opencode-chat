import { auth } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";

import { getModel, DEFAULT_MODEL_ID, type ModelId } from "@/lib/ai";
import { searchTool, scrapeTool } from "@/lib/tools";
import { db } from "@/lib/db";
import { chatSessions } from "@/lib/db/schema";
import {
  deleteMessagesAfter,
  loadSessionMessages,
  saveSingleMessage,
} from "@/lib/chat/messages";

export const maxDuration = 300;

export async function POST(req: Request) {
  const {
    message,
    model,
    sessionId,
  }: {
    message: UIMessage;
    model?: ModelId;
    sessionId: string;
  } = await req.json();

  const { userId, orgId } = await auth();
  const authId = userId ?? "anonymous";
  const tenantId = orgId ?? "default";
  const nucleusId = authId;

  await db
    .insert(chatSessions)
    .values({ id: sessionId, nucleusId, tenantId, authId })
    .onConflictDoNothing();

  if (message?.role !== "user") {
    return new Response("expected user message", { status: 400 });
  }

  await saveSingleMessage(sessionId, message);
  await deleteMessagesAfter(sessionId, message.id);

  const previous = await loadSessionMessages({
    sessionId,
    nucleusId,
    authId,
  });
  const allMessages: UIMessage[] = previous.some((m) => m.id === message.id)
    ? previous
    : [...previous, message];

  const result = streamText({
    model: getModel(model ?? DEFAULT_MODEL_ID),
    messages: await convertToModelMessages(allMessages),
    tools: {
      search: searchTool,
      scrape: scrapeTool,
    },
    stopWhen: stepCountIs(10),
  });

  const response = result.toUIMessageStreamResponse({
    originalMessages: allMessages,
    generateMessageId: createId,
    onFinish: async ({ responseMessage }) => {
      if (responseMessage.role !== "assistant") return;
      await saveSingleMessage(sessionId, responseMessage as UIMessage);
    },
    onError: (err: unknown) => {
      console.error("[chat] UI stream onError", err);
      return err instanceof Error ? err.message : String(err);
    },
  });

  void result.consumeStream();

  return response;
}
