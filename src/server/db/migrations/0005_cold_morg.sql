CREATE TABLE "survey_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"text" text NOT NULL,
	"type" "question_types" NOT NULL,
	"multiple_choice_options" text[] DEFAULT '{}'::text[] NOT NULL,
	"min_label" text,
	"min_value" integer,
	"max_label" text,
	"max_value" integer,
	"min_selected_options" integer,
	"max_selected_options" integer,
	"position" integer NOT NULL,
	"randomized" boolean DEFAULT false NOT NULL,
	"has_other_option" boolean DEFAULT false NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;