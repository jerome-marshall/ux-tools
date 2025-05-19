CREATE TABLE "survey_question_results" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"test_id" text NOT NULL,
	"test_result_id" text NOT NULL,
	"duration_ms" integer NOT NULL,
	"answer" text,
	"answers" text[] DEFAULT '{}'::text[],
	"paste_detected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "survey_question_results" ADD CONSTRAINT "survey_question_results_question_id_survey_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."survey_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_question_results" ADD CONSTRAINT "survey_question_results_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_question_results" ADD CONSTRAINT "survey_question_results_test_result_id_test_results_id_fk" FOREIGN KEY ("test_result_id") REFERENCES "public"."test_results"("id") ON DELETE cascade ON UPDATE no action;