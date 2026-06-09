CREATE TABLE "availability_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"photographer_id" integer NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "availability_time_order" CHECK ("availability_slots"."end_time" > "availability_slots"."start_time")
);
--> statement-breakpoint
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_photographer_id_photographers_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."photographers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_availability_photographer_date" ON "availability_slots" USING btree ("photographer_id","date");