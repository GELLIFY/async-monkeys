import { relations, sql } from "drizzle-orm";
import { unique } from "drizzle-orm/pg-core";
import { timestamps } from "../utils";
import { createTable } from "./_table";
import { user } from "./auth-schema";

export const teamTable = createTable("team", (d) => ({
  id: d.uuid().default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
  ...timestamps,

  name: d.varchar({ length: 60 }).notNull(),
  teamLeaderId: d
    .uuid("team_leader_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
}));

export const teamMembershipTable = createTable(
  "team_membership",
  (d) => ({
    id: d.uuid().default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    ...timestamps,

    teamId: d
      .uuid()
      .references(() => teamTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: d
      .uuid()
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
  }),
  (t) => [unique("team_membership_unique").on(t.teamId, t.userId)],
);

export const teamRelations = relations(teamTable, ({ one, many }) => ({
  leader: one(user, { fields: [teamTable.teamLeaderId], references: [user.id] }),
  memberships: many(teamMembershipTable),
}));

export const teamMembershipRelations = relations(
  teamMembershipTable,
  ({ one }) => ({
    team: one(teamTable, {
      fields: [teamMembershipTable.teamId],
      references: [teamTable.id],
    }),
    user: one(user, {
      fields: [teamMembershipTable.userId],
      references: [user.id],
    }),
  }),
);

export type DB_TeamType = typeof teamTable.$inferSelect;
export type DB_TeamInsertType = typeof teamTable.$inferInsert;
export type DB_TeamMembershipType = typeof teamMembershipTable.$inferSelect;
export type DB_TeamMembershipInsertType =
  typeof teamMembershipTable.$inferInsert;
