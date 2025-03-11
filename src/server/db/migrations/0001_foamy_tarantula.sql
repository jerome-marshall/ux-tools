ALTER TABLE "tests" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tree_tests" ADD COLUMN "correct_paths" jsonb NOT NULL;