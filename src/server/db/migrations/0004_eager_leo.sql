CREATE TABLE "tree_test_results" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"total_duration_ms" integer NOT NULL,
	"task_duration_ms" integer NOT NULL,
	"tree_test_clicks" jsonb NOT NULL,
	"passed" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tree_test_results" ADD CONSTRAINT "tree_test_results_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;