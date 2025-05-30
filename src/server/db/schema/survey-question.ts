import { surveyQuestionTypes } from '@/zod-schemas/survey-question.schema'
import { sql } from 'drizzle-orm'
import { boolean, integer, json, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { testResults, tests } from './test'
import { timestamps, uniqueId } from './utils'
import { type ChoiceOption } from '@/types'

export const questionTypesEnum = pgEnum('question_types', surveyQuestionTypes)

export const surveyQuestions = pgTable('survey_questions', {
  id: uniqueId,
  testId: text('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  type: questionTypesEnum('type').notNull(),
  multipleChoiceOptions: json('multiple_choice_options')
    .notNull()
    .default(sql`'[]'::json`)
    .$type<ChoiceOption[]>(),
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

export const surveyQuestionResults = pgTable('survey_question_results', {
  id: uniqueId,
  questionId: text('question_id')
    .notNull()
    .references(() => surveyQuestions.id, { onDelete: 'cascade' }),
  testId: text('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  testResultId: text('test_result_id')
    .notNull()
    .references(() => testResults.id, { onDelete: 'cascade' }),
  durationMs: integer('duration_ms').notNull(),
  answer: text('answer'),
  answers: text('answers')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  skipped: boolean('skipped').notNull().default(false),
  pasteDetected: boolean('paste_detected').notNull().default(false),
  ...timestamps
})

export const surveyQuestionInsertSchema = createInsertSchema(surveyQuestions)
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    id: z.string().uuid(),
    multipleChoiceOptions: z
      .array(z.object({ id: z.string(), value: z.string() }))
      .default([])
  })

export type SurveyQuestion = typeof surveyQuestions.$inferSelect
export type SurveyQuestionInsert = z.infer<typeof surveyQuestionInsertSchema>

export const surveyQuestionResultInsertSchema = createInsertSchema(surveyQuestionResults)
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    answers: z.array(z.string()).default([])
  })

export type SurveyQuestionResult = typeof surveyQuestionResults.$inferSelect
export type SurveyQuestionResultInsert = z.infer<typeof surveyQuestionResultInsertSchema>
