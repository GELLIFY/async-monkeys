"server-only";

import { eq } from "drizzle-orm";
import type { DBClient } from "@/server/db";
import { sessionTable } from "@/server/db/schema/session-schema";

export async function setSessionPhaseMutation(
  db: DBClient,
  sessionId: string,
  phase: (typeof sessionTable.$inferInsert)["currentPhase"],
) {
  const [updated] = await db
    .update(sessionTable)
    .set({ currentPhase: phase })
    .where(eq(sessionTable.id, sessionId))
    .returning();

  if (!updated) throw new Error("Session not found");
  return updated;
}
