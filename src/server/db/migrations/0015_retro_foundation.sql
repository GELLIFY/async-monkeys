CREATE TYPE "public"."session_phase" AS ENUM('pending', 'raccolta', 'votazione', 'discussione', 'action_items', 'closed');
--> statement-breakpoint
CREATE TABLE "acme_team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"name" varchar(60) NOT NULL,
	"team_leader_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acme_team_membership" (
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acme_retro_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"team_id" uuid NOT NULL,
	"title" varchar(120) NOT NULL,
	"facilitator_id" uuid NOT NULL,
	"current_phase" "session_phase" DEFAULT 'pending' NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "acme_team" ADD CONSTRAINT "acme_team_team_leader_id_acme_user_id_fk" FOREIGN KEY ("team_leader_id") REFERENCES "public"."acme_user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acme_team_membership" ADD CONSTRAINT "acme_team_membership_user_id_acme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."acme_user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acme_team_membership" ADD CONSTRAINT "acme_team_membership_team_id_acme_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."acme_team"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acme_retro_session" ADD CONSTRAINT "acme_retro_session_team_id_acme_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."acme_team"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "acme_retro_session" ADD CONSTRAINT "acme_retro_session_facilitator_id_acme_user_id_fk" FOREIGN KEY ("facilitator_id") REFERENCES "public"."acme_user"("id") ON DELETE cascade ON UPDATE no action;
