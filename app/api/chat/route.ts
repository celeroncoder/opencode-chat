import { auth } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import {
  convertToModelMessages,
  generateObject,
  smoothStream,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import * as z from "zod";

import {
  observe,
  propagateAttributes,
  setActiveTraceIO,
} from "@langfuse/tracing";
import { trace } from "@opentelemetry/api";

import { getModel, DEFAULT_MODEL_ID, type ModelId } from "@/lib/ai";
import { searchTool, scrapeTool } from "@/lib/tools";
import { db } from "@/lib/db";
import { chatSessions } from "@/lib/db/schema";
import {
  deleteMessagesAfter,
  loadSessionMessages,
  saveSingleMessage,
} from "@/lib/chat/messages";
import { langfuseSpanProcessor } from "@/instrumentation";

export const maxDuration = 300;

const handler = async (req: Request) => {
  const [
    {
      message,
      model,
      sessionId,
    },
    { userId, orgId },
  ]: [
    {
      message: UIMessage;
      model?: ModelId;
      sessionId: string;
    },
    Awaited<ReturnType<typeof auth>>,
  ] = await Promise.all([req.json(), auth()]);
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

  const previousBefore = await loadSessionMessages({
    sessionId,
    nucleusId,
    authId,
  });
  const isFirstUserMessage = !previousBefore.some((m) => m.role === "user");

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

  let userText = "";
  for (const part of message.parts ?? []) {
    if (part.type === "text") {
      userText += `${userText ? "\n" : ""}${part.text}`;
    }
  }
  userText = userText.trim();

  setActiveTraceIO({ input: userText || message });

  return propagateAttributes(
    {
      sessionId,
      userId: authId,
      tags: [`tenant:${tenantId}`],
    },
    async () => {
  if (isFirstUserMessage) {
    if (userText) {
      void generateObject({
        model: getModel("deepseek-v4-flash"),
        schema: z.object({
          title: z
            .string()
            .max(60)
            .describe("A concise 3-6 word title for this chat."),
        }),
        prompt: `Generate a concise, descriptive title (3-6 words, no quotes, no trailing punctuation) for a chat that starts with this user message. Respond as JSON matching the schema { "title": string }.\n\nUser message:\n${userText}`,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "generate-chat-title",
        },
      })
        .then(async ({ object }) => {
          const title = object.title.trim().slice(0, 255);
          if (!title) return;
          await db
            .update(chatSessions)
            .set({ title })
            .where(eq(chatSessions.id, sessionId));
        })
        .catch((err) => {
          console.error("[chat] title generation failed", err);
        });
    }
  }

  const result = streamText({
    model: getModel(model ?? DEFAULT_MODEL_ID),
    messages: await convertToModelMessages(allMessages),
    tools: {
      search: searchTool,
      scrape: scrapeTool,
    },
    experimental_transform: smoothStream({ chunking: "word" }),
    stopWhen: stepCountIs(10),
    experimental_telemetry: {
      isEnabled: true,
      functionId: "chat-response",
    },
    onFinish: ({ text }) => {
      setActiveTraceIO({ output: text });
      trace.getActiveSpan()?.end();
    },
    onError: (error) => {
      setActiveTraceIO({ output: error });
      trace.getActiveSpan()?.end();
    },
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

  after(async () => {
    await langfuseSpanProcessor.forceFlush();
  });

  return response;
    },
  );
};

export const POST = observe(handler, {
  name: "handle-chat-message",
  endOnExit: false,
});
