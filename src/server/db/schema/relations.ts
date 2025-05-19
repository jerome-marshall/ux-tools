import { relations } from 'drizzle-orm'
import { user } from './auth'
import { projects, studies } from './project-study'
import { surveyQuestionResults, surveyQuestions } from './survey-question'
import { testResults, tests } from './test'
import { treeTestResults, treeTests } from './tree-test'

export const projectRelations = relations(projects, ({ many, one }) => ({
  studies: many(studies),
  owner: one(user, {
    fields: [projects.ownerId],
    references: [user.id]
  })
}))

export const studyRelations = relations(studies, ({ one, many }) => ({
  project: one(projects, {
    fields: [studies.projectId],
    references: [projects.id]
  }),
  tests: many(tests),
  owner: one(user, {
    fields: [studies.ownerId],
    references: [user.id]
  })
}))

export const testRelations = relations(tests, ({ one, many }) => ({
  study: one(studies, {
    fields: [tests.studyId],
    references: [studies.id]
  }),
  treeTest: one(treeTests, {
    fields: [tests.id],
    references: [treeTests.testId]
  }),
  treeTestResults: many(treeTestResults),
  surveyQuestions: many(surveyQuestions),
  surveyQuestionResults: many(surveyQuestionResults)
}))

export const treeTestRelations = relations(treeTests, ({ one }) => ({
  test: one(tests, {
    fields: [treeTests.testId],
    references: [tests.id]
  })
}))

export const testResultRelations = relations(testResults, ({ one, many }) => ({
  test: one(tests, {
    fields: [testResults.testId],
    references: [tests.id]
  }),
  treeTestResults: many(treeTestResults),
  surveyQuestionResults: many(surveyQuestionResults)
}))

export const treeTestResultRelations = relations(treeTestResults, ({ one }) => ({
  testResult: one(testResults, {
    fields: [treeTestResults.testResultId],
    references: [testResults.id]
  })
}))

export const surveyQuestionRelations = relations(surveyQuestions, ({ one, many }) => ({
  test: one(tests, {
    fields: [surveyQuestions.testId],
    references: [tests.id]
  }),
  results: many(surveyQuestionResults)
}))

export const surveyQuestionResultRelations = relations(
  surveyQuestionResults,
  ({ one }) => ({
    question: one(surveyQuestions, {
      fields: [surveyQuestionResults.questionId],
      references: [surveyQuestions.id]
    }),
    testResult: one(testResults, {
      fields: [surveyQuestionResults.testResultId],
      references: [testResults.id]
    })
  })
)
