import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/db/schema";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return new Response("unauthorized", { status: 401 });
  const { id } = await params;

  const owned = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(
      and(eq(chatSessions.id, id), eq(chatSessions.authId, userId)),
    )
    .limit(1);

  if (owned.length === 0) return new Response("not found", { status: 404 });

  await db.delete(chatMessages).where(eq(chatMessages.sessionId, id));
  await db.delete(chatSessions).where(eq(chatSessions.id, id));

  return new Response(null, { status: 204 });
}
