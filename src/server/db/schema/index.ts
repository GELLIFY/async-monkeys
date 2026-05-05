import * as auth from "./auth-schema";
import * as session from "./session-schema";
import * as team from "./team-schema";
import * as todo from "./todos";

export const schema = { ...auth, ...todo, ...team, ...session };