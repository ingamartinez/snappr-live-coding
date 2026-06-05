CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"photographer_id" integer NOT NULL,
	"client_name" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photographers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"hourly_rate" integer NOT NULL,
	"rating" numeric(2, 1) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hourly_rate_nonneg" CHECK ("photographers"."hourly_rate" >= 0),
	CONSTRAINT "rating_range" CHECK ("photographers"."rating" >= 0 AND "photographers"."rating" <= 5)
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_photographer_id_photographers_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."photographers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bookings_photographer" ON "bookings" USING btree ("photographer_id");--> statement-breakpoint
CREATE INDEX "idx_photographers_city" ON "photographers" USING btree ("city");