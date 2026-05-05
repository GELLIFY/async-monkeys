import { relations } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";
import { timestamps } from "../utils";
import { createTable } from "./_table";
import { user } from "./auth-schema";
import { teamTable } from "./team";

export const sessionPhaseEnum = pgEnum("session_phase", [
  "pending",
  "raccolta",
  "votazione",
  "discussione",
  "action_items",
  "closed",
]);

export const sessionTable = createTable("retro_session", (d) => ({
  id: d.uuid("id").defaultRandom().primaryKey(),
  ...timestamps,
  teamId: d
    .uuid()
    .references(() => teamTable.id, { onDelete: "cascade" })
    .notNull(),
  title: d.varchar({ length: 120 }).notNull(),
  facilitatorId: d
    .uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  currentPhase: sessionPhaseEnum().default("pending").notNull(),
  closedAt: d.timestamp({ withTimezone: true, mode: "string" }),
}));

export const retroSessionRelations = relations(sessionTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [sessionTable.teamId],
    references: [teamTable.id],
  }),
  facilitator: one(user, {
    fields: [sessionTable.facilitatorId],
    references: [user.id],
  }),
}));

export type DB_SessionType = typeof sessionTable.$inferSelect;
export type DB_SessionInsertType = typeof sessionTable.$inferInsert;
export type SessionPhase = (typeof sessionPhaseEnum.enumValues)[number];
