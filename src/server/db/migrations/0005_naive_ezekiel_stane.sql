CREATE TABLE "test_results" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"user_id" text NOT NULL,
	"total_duration_ms" integer NOT NULL,
	"task_duration_ms" integer NOT NULL,
	"status" text DEFAULT 'NOT_STARTED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tree_test_results" DROP CONSTRAINT "tree_test_results_test_id_tests_id_fk";
--> statement-breakpoint
ALTER TABLE "tree_test_results" ADD COLUMN "test_result_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_test_results" ADD CONSTRAINT "tree_test_results_test_result_id_test_results_id_fk" FOREIGN KEY ("test_result_id") REFERENCES "public"."test_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_test_results" DROP COLUMN "test_id";--> statement-breakpoint
ALTER TABLE "tree_test_results" DROP COLUMN "total_duration_ms";--> statement-breakpoint
ALTER TABLE "tree_test_results" DROP COLUMN "task_duration_ms";