import { surveyQuestionTypes } from '@/zod-schemas/survey-question.schema'
import { sql } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { tests } from './test'
import { timestamps, uniqueId } from './utils'

export const questionTypesEnum = pgEnum('question_types', surveyQuestionTypes)

export const surveyQuestions = pgTable('survey_questions', {
  id: uniqueId,
  testId: text('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  type: questionTypesEnum('type').notNull(),
  multipleChoiceOptions: text('multiple_choice_options')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  minLabel: text('min_label'),
  minValue: integer('min_value'),
  maxLabel: text('max_label'),
  maxValue: integer('max_value'),
  minSelectedOptions: integer('min_selected_options'),
  maxSelectedOptions: integer('max_selected_options'),
  position: integer('position').notNull(),
  randomized: boolean('randomized').notNull().default(false),
  hasOtherOption: boolean('has_other_option').notNull().default(false),
  required: boolean('required').notNull().default(false),
  ...timestamps
})

export const surveyQuestionInsertSchema = createInsertSchema(surveyQuestions)
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    id: z.string(),
    multipleChoiceOptions: z.array(z.string()).default([])
  })

export type SurveyQuestion = typeof surveyQuestions.$inferSelect
export type SurveyQuestionInsert = z.infer<typeof surveyQuestionInsertSchema>
