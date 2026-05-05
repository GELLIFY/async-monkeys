import { addTeamMember } from "@/server/domains/team/team-membership-service";
import { addTeamMemberSchema } from "@/shared/validators/team.schema";
import { createTRPCRouter, protectedProcedure } from "../init";

export const teamRouter = createTRPCRouter({
  addMember: protectedProcedure
    .input(addTeamMemberSchema)
    .mutation(async ({ ctx: { db, session }, input }) => {
      return await addTeamMember(db, {
        teamId: input.teamId,
        targetUserId: input.userId,
        requesterId: session.user.id,
      });
    }),
});
