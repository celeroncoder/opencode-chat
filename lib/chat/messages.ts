import "server-only";

import { and, asc, eq, gt } from "drizzle-orm";
import type { UIMessage } from "ai";

import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/db/schema";

export async function saveSingleMessage(
  sessionId: string,
  message: UIMessage,
): Promise<void> {
  await db
    .insert(chatMessages)
    .values({
      id: message.id,
      sessionId,
      role: message.role,
      parts: message.parts as unknown as object,
    })
    .onConflictDoUpdate({
      target: chatMessages.id,
      set: { parts: message.parts as unknown as object, role: message.role },
    });
}

export async function deleteMessagesAfter(
  sessionId: string,
  anchorMessageId: string,
): Promise<void> {
  const anchor = await db
    .select({ createdAt: chatMessages.createdAt })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.sessionId, sessionId),
        eq(chatMessages.id, anchorMessageId),
      ),
    )
    .limit(1);
  if (anchor.length === 0) return;
  await db
    .delete(chatMessages)
    .where(
      and(
        eq(chatMessages.sessionId, sessionId),
        gt(chatMessages.createdAt, anchor[0].createdAt),
      ),
    );
}

export async function loadSessionMessages({
  sessionId,
  nucleusId,
  authId,
}: {
  sessionId: string;
  nucleusId: string;
  authId: string;
}): Promise<UIMessage[]> {
  const session = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(
      and(
        eq(chatSessions.id, sessionId),
        eq(chatSessions.nucleusId, nucleusId),
        eq(chatSessions.authId, authId),
      ),
    )
    .limit(1);

  if (session.length === 0) return [];

  const rows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      parts: chatMessages.parts,
    })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt));

  return rows.map((r) => ({
    id: r.id,
    role: r.role as UIMessage["role"],
    parts: r.parts as UIMessage["parts"],
  }));
}
