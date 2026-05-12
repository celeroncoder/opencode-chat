import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { chatSessions } from "@/lib/db/schema";

export async function listSessions({
  nucleusId,
  authId,
}: {
  nucleusId: string;
  authId: string;
}) {
  return db
    .select({
      id: chatSessions.id,
      title: chatSessions.title,
      updatedAt: chatSessions.updatedAt,
    })
    .from(chatSessions)
    .where(
      and(
        eq(chatSessions.nucleusId, nucleusId),
        eq(chatSessions.authId, authId),
      ),
    )
    .orderBy(desc(chatSessions.updatedAt))
    .limit(100);
}
