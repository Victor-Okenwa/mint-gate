CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"guidelines" text[] DEFAULT '{}' NOT NULL,
	"mint_price" numeric(20, 8) DEFAULT '0' NOT NULL,
	"hidden_link" text,
	"creator_address" text NOT NULL,
	"tx_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"user_address" text NOT NULL,
	"tx_hash" text
);
--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "members_community_user_uidx" ON "members" USING btree ("community_id","user_address");--> statement-breakpoint
CREATE INDEX "members_user_address_idx" ON "members" USING btree ("user_address");