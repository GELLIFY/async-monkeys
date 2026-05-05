import { beforeEach, expect, test } from "bun:test";
import { TRPCError } from "@trpc/server";
import { randomUUIDv7 } from "bun";
import { db } from "@/server/db";
import { user as userTable } from "@/server/db/schema/auth-schema";
import { teamMembershipTable, teamTable } from "@/server/db/schema/team";
import { createCallerFactory, createTRPCRouter } from "../init";
import { teamRouter } from "./team";

const leaderId = randomUUIDv7();
const targetUserId = randomUUIDv7();
let teamId: string;

const caller = createCallerFactory(createTRPCRouter({ team: teamRouter }));

function makeCtx(userId: string) {
  return {
    db,
    session: { user: { id: userId, role: "user" as const, name: "Test", email: "test@test.com", emailVerified: false, createdAt: new Date(), updatedAt: new Date(), image: null, banned: null, banReason: null, banExpires: null, twoFactorEnabled: null } },
    wideEvent: {} as Record<string, unknown>,
    headers: new Headers(),
  };
}

beforeEach(async () => {
  await db.insert(userTable).values([
    { id: leaderId, email: "leader@test.com", name: "Leader" },
    { id: targetUserId, email: "target@test.com", name: "Target" },
  ]);

  const [team] = await db
    .insert(teamTable)
    .values({ name: "Team Alpha", teamLeaderId: leaderId })
    .returning();
  teamId = team!.id;

  await db.insert(teamMembershipTable).values({ teamId, userId: leaderId });
});

test("team.addMember - aggiunge membro e restituisce la membership", async () => {
  const trpc = caller(makeCtx(leaderId));

  const membership = await trpc.team.addMember({ teamId, userId: targetUserId });

  expect(membership).toBeDefined();
  expect(membership.userId).toEqual(targetUserId);
  expect(membership.teamId).toEqual(teamId);
});

test("team.addMember - rifiuta richiesta senza sessione con UNAUTHORIZED", async () => {
  const unauthCtx = { db, session: null, wideEvent: {} as Record<string, unknown>, headers: new Headers() };
  const trpc = caller(unauthCtx as never);
  let error: unknown;

  try {
    await trpc.team.addMember({ teamId, userId: targetUserId });
  } catch (e) {
    error = e;
  }

  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toEqual("UNAUTHORIZED");
});

test("team.addMember - rifiuta teamId non UUID con BAD_REQUEST", async () => {
  const trpc = caller(makeCtx(leaderId));
  let error: unknown;

  try {
    await trpc.team.addMember({ teamId: "not-a-uuid", userId: targetUserId });
  } catch (e) {
    error = e;
  }

  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toEqual("BAD_REQUEST");
});

test("team.addMember - rifiuta userId non UUID con BAD_REQUEST", async () => {
  const trpc = caller(makeCtx(leaderId));
  let error: unknown;

  try {
    await trpc.team.addMember({ teamId, userId: "not-a-uuid" });
  } catch (e) {
    error = e;
  }

  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toEqual("BAD_REQUEST");
});
