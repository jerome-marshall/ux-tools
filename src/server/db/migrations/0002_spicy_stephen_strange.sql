ALTER TABLE "tests" DROP CONSTRAINT "tests_study_id_studies_id_fk";
--> statement-breakpoint
ALTER TABLE "tree_tests" DROP CONSTRAINT "tree_tests_test_id_tests_id_fk";
--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_tests" ADD CONSTRAINT "tree_tests_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;