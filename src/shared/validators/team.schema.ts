import * as z from "zod";

export const addTeamMemberSchema = z.object({
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
});
