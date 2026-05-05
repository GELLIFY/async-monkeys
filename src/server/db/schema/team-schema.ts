import { relations } from "drizzle-orm";
import { timestamps } from "../utils";
import { createTable } from "./_table";
import { user } from "./auth-schema";

export const teamTable = createTable("team", (d) => ({
  id: d.uuid("id").defaultRandom().primaryKey(),
  ...timestamps,
  name: d.varchar({ length: 60 }).notNull(),
  teamLeaderId: d
    .uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
}));

export const teamMembershipTable = createTable("team_membership", (d) => ({
  userId: d
    .uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  teamId: d
    .uuid()
    .references(() => teamTable.id, { onDelete: "cascade" })
    .notNull(),
}));

export const teamRelations = relations(teamTable, ({ one, many }) => ({
  teamLeader: one(user, {
    fields: [teamTable.teamLeaderId],
    references: [user.id],
  }),
  memberships: many(teamMembershipTable),
}));

export const teamMembershipRelations = relations(
  teamMembershipTable,
  ({ one }) => ({
    user: one(user, {
      fields: [teamMembershipTable.userId],
      references: [user.id],
    }),
    team: one(teamTable, {
      fields: [teamMembershipTable.teamId],
      references: [teamTable.id],
    }),
  }),
);

export type DB_TeamType = typeof teamTable.$inferSelect;
export type DB_TeamInsertType = typeof teamTable.$inferInsert;
