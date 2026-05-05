CREATE TABLE "acme_team_membership" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "team_membership_unique" UNIQUE("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "acme_team" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"name" varchar(60) NOT NULL,
	"leader_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "acme_team_membership" ADD CONSTRAINT "acme_team_membership_team_id_acme_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."acme_team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acme_team_membership" ADD CONSTRAINT "acme_team_membership_user_id_acme_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."acme_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acme_team" ADD CONSTRAINT "acme_team_leader_id_acme_user_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."acme_user"("id") ON DELETE cascade ON UPDATE no action;