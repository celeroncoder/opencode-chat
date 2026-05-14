"use server";

import { auth } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/lib/db";
import { chatSessions } from "@/lib/db/schema";
import { DEFAULT_MODEL_ID, type ModelId } from "@/lib/models";

export async function createChat(
  model: ModelId = DEFAULT_MODEL_ID,
): Promise<{ id: string }> {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const id = createId();
  const nucleusId = userId;
  const tenantId = orgId ?? "default";

  await db
    .insert(chatSessions)
    .values({ id, nucleusId, tenantId, authId: userId })
    .onConflictDoNothing();

  return { id };
}
