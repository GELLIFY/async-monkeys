import { beforeEach, expect, test } from "bun:test";
import { TRPCError } from "@trpc/server";
import { randomUUIDv7 } from "bun";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user as userTable } from "@/server/db/schema/auth-schema";
import {
  teamMembershipTable,
  teamTable,
} from "@/server/db/schema/team";
import { addTeamMember } from "./team-membership-service";

const leaderId = randomUUIDv7();
const targetUserId = randomUUIDv7();
const nonLeaderId = randomUUIDv7();
let teamId: string;

beforeEach(async () => {
  await db.insert(userTable).values([
    { id: leaderId, email: "leader@test.com", name: "Leader" },
    { id: targetUserId, email: "target@test.com", name: "Target" },
    { id: nonLeaderId, email: "nonleader@test.com", name: "Non Leader" },
  ]);

  const [team] = await db
    .insert(teamTable)
    .values({ name: "Team Alpha", teamLeaderId: leaderId })
    .returning();

  teamId = team!.id;

  // leader is automatically a member (as per US-01)
  await db
    .insert(teamMembershipTable)
    .values({ teamId, userId: leaderId });
});

test("addTeamMember - aggiunge membro quando richiedente è team leader", async () => {
  const membership = await addTeamMember(db, {
    teamId,
    targetUserId,
    requesterId: leaderId,
  });

  expect(membership).toBeDefined();
  expect(membership.userId).toEqual(targetUserId);
  expect(membership.teamId).toEqual(teamId);
});

test("addTeamMember - è idempotente se l'utente è già membro", async () => {
  await addTeamMember(db, { teamId, targetUserId, requesterId: leaderId });

  // second call must not throw and must not create a duplicate
  const membership = await addTeamMember(db, {
    teamId,
    targetUserId,
    requesterId: leaderId,
  });

  expect(membership).toBeDefined();
  expect(membership.userId).toEqual(targetUserId);

  const allMemberships = await db.query.teamMembershipTable.findMany();
  // leader + targetUser = 2 rows, no duplicates
  expect(allMemberships.length).toEqual(2);
});

test("addTeamMember - lancia UNAUTHORIZED se il richiedente non è team leader", async () => {
  let error: unknown;

  try {
    await addTeamMember(db, {
      teamId,
      targetUserId,
      requesterId: nonLeaderId,
    });
  } catch (e) {
    error = e;
  }

  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toEqual("UNAUTHORIZED");

  // no membership must have been created
  const memberships = await db.query.teamMembershipTable.findMany();
  expect(memberships.length).toEqual(1); // only the leader
});

test("addTeamMember - lancia NOT_FOUND se targetUserId non esiste", async () => {
  const ghostUserId = randomUUIDv7();
  let error: unknown;

  try {
    await addTeamMember(db, {
      teamId,
      targetUserId: ghostUserId,
      requesterId: leaderId,
    });
  } catch (e) {
    error = e;
  }

  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toEqual("NOT_FOUND");

  // no membership must have been created
  const memberships = await db.query.teamMembershipTable.findMany();
  expect(memberships.length).toEqual(1); // only the leader
});

test("addTeamMember - è idempotente quando il team leader aggiunge se stesso", async () => {
  const membership = await addTeamMember(db, {
    teamId,
    targetUserId: leaderId,
    requesterId: leaderId,
  });

  expect(membership).toBeDefined();
  expect(membership.userId).toEqual(leaderId);

  // still only 1 membership row (the leader's, no duplicate)
  const allMemberships = await db.query.teamMembershipTable.findMany();
  expect(allMemberships.length).toEqual(1);
});

test("addTeamMember - un utente può essere membro di più team in parallelo", async () => {
  const leader2Id = randomUUIDv7();
  await db
    .insert(userTable)
    .values({ id: leader2Id, email: "leader2@test.com", name: "Leader 2" });

  const [team2] = await db
    .insert(teamTable)
    .values({ name: "Team Beta", teamLeaderId: leader2Id })
    .returning();
  await db
    .insert(teamMembershipTable)
    .values({ teamId: team2!.id, userId: leader2Id });

  const m1 = await addTeamMember(db, {
    teamId,
    targetUserId,
    requesterId: leaderId,
  });
  const m2 = await addTeamMember(db, {
    teamId: team2!.id,
    targetUserId,
    requesterId: leader2Id,
  });

  expect(m1.userId).toEqual(targetUserId);
  expect(m1.teamId).toEqual(teamId);
  expect(m2.userId).toEqual(targetUserId);
  expect(m2.teamId).toEqual(team2!.id);

  // targetUser has 2 distinct memberships
  const userMemberships = await db.query.teamMembershipTable.findMany({
    where: eq(teamMembershipTable.userId, targetUserId),
  });
  expect(userMemberships.length).toEqual(2);
});

test("addTeamMember - lancia NOT_FOUND se il team non esiste", async () => {
  const ghostTeamId = randomUUIDv7();
  let error: unknown;

  try {
    await addTeamMember(db, {
      teamId: ghostTeamId,
      targetUserId,
      requesterId: leaderId,
    });
  } catch (e) {
    error = e;
  }

  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toEqual("NOT_FOUND");
});
