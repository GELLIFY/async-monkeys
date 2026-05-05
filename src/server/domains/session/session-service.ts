"server-only";

import type { DBClient } from "@/server/db";
import { getSessionByIdQuery } from "./queries";
import { setSessionPhaseMutation } from "./mutations";

export async function openCollectionPhase(
  db: DBClient,
  sessionId: string,
  requesterId: string,
) {
  const session = await getSessionByIdQuery(db, sessionId);

  if (!session) throw new Error("SESSION_NOT_FOUND");

  if (session.facilitatorId !== requesterId) throw new Error("UNAUTHORIZED");

  if (session.currentPhase === "closed") throw new Error("SESSION_CLOSED");

  if (session.currentPhase !== "pending")
    throw new Error("SESSION_ALREADY_STARTED");

  return setSessionPhaseMutation(db, sessionId, "raccolta");
}
