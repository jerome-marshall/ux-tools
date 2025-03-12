ALTER TABLE "studies" DROP CONSTRAINT "studies_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "studies" ADD CONSTRAINT "studies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;