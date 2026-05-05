import { beforeEach, expect, test } from "bun:test";
import { db } from "@/server/db";
import { user as userTable } from "@/server/db/schema/auth-schema";
import { sessionTable } from "@/server/db/schema/session-schema";
import { teamTable } from "@/server/db/schema/team-schema";
import { openCollectionPhase } from "./session-service";

const FACILITATOR_ID = "00000000-0000-0000-0000-000000000001";
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000002";
const TEAM_ID = "00000000-0000-0000-0000-000000000010";

beforeEach(async () => {
  await db.insert(userTable).values([
    { id: FACILITATOR_ID, email: "facilitator@test.com", name: "Facilitator" },
    { id: OTHER_USER_ID, email: "other@test.com", name: "Other" },
  ]).onConflictDoNothing();

  await db.insert(teamTable).values({
    id: TEAM_ID,
    name: "Team Alpha",
    teamLeaderId: FACILITATOR_ID,
  }).onConflictDoNothing();
});

async function createPendingSession(overrides?: Partial<typeof sessionTable.$inferInsert>) {
  const [session] = await db.insert(sessionTable).values({
    teamId: TEAM_ID,
    title: "Retro Sprint 1",
    facilitatorId: FACILITATOR_ID,
    currentPhase: "pending",
    ...overrides,
  }).returning();
  return session!;
}

// --- Behavior 1: facilitator can open raccolta on a pending session ---

test("facilitator opens raccolta on pending session → currentPhase becomes raccolta", async () => {
  const session = await createPendingSession();

  const updated = await openCollectionPhase(db, session.id, FACILITATOR_ID);

  expect(updated.currentPhase).toBe("raccolta");
});

// --- Behavior 2: non-facilitator is rejected ---

test("non-facilitator cannot open raccolta → throws UNAUTHORIZED", async () => {
  const session = await createPendingSession();

  expect(
    openCollectionPhase(db, session.id, OTHER_USER_ID),
  ).rejects.toThrow("UNAUTHORIZED");
});

// --- Behavior 3: cannot open raccolta on already-active session ---

test("cannot open raccolta when session is already in an active phase → throws SESSION_ALREADY_STARTED", async () => {
  const session = await createPendingSession({ currentPhase: "raccolta" });

  expect(
    openCollectionPhase(db, session.id, FACILITATOR_ID),
  ).rejects.toThrow("SESSION_ALREADY_STARTED");
});

// --- Behavior 4: cannot open raccolta on closed session ---

test("cannot open raccolta on a closed session → throws SESSION_CLOSED", async () => {
  const session = await createPendingSession({ currentPhase: "closed" });

  expect(
    openCollectionPhase(db, session.id, FACILITATOR_ID),
  ).rejects.toThrow("SESSION_CLOSED");
});
