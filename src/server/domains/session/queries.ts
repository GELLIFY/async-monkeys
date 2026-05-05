"server-only";

import { eq } from "drizzle-orm";
import type { DBClient } from "@/server/db";
import { sessionTable } from "@/server/db/schema/session-schema";

export async function getSessionByIdQuery(db: DBClient, sessionId: string) {
  const [session] = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.id, sessionId))
    .limit(1);
  return session;
}
