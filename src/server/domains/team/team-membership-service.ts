"server-only";

import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { DBClient } from "@/server/db";
import { user as userTable } from "@/server/db/schema/auth-schema";
import { teamMembershipTable, teamTable } from "@/server/db/schema/team";

type AddTeamMemberParams = {
  teamId: string;
  targetUserId: string;
  requesterId: string;
};

export async function addTeamMember(db: DBClient, params: AddTeamMemberParams) {
  const { teamId, targetUserId, requesterId } = params;

  const team = await db.query.teamTable.findFirst({
    where: eq(teamTable.id, teamId),
  });

  if (!team) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Team non trovato" });
  }

  if (team.leaderId !== requesterId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Solo il team leader può aggiungere membri",
    });
  }

  const targetUser = await db.query.user.findFirst({
    where: eq(userTable.id, targetUserId),
  });

  if (!targetUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Utente non trovato",
    });
  }

  const [membership] = await db
    .insert(teamMembershipTable)
    .values({ teamId, userId: targetUserId })
    .onConflictDoNothing()
    .returning();

  if (membership) return membership;

  // already a member — return existing row (idempotent)
  const existing = await db.query.teamMembershipTable.findFirst({
    where: and(
      eq(teamMembershipTable.teamId, teamId),
      eq(teamMembershipTable.userId, targetUserId),
    ),
  });

  if (!existing) {
    throw new Error("Impossibile creare la membership");
  }

  return existing;
}
