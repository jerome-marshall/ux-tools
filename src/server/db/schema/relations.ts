import { testResults } from './test'

import { treeTestResults } from './tree-test'

import { studies } from './project-study'

import { relations } from 'drizzle-orm'
import { projects } from './project-study'
import { tests } from './test'
import { treeTests } from './tree-test'

export const projectRelations = relations(projects, ({ many }) => ({
  studies: many(studies)
}))
export const studyRelations = relations(studies, ({ one, many }) => ({
  project: one(projects, {
    fields: [studies.projectId],
    references: [projects.id]
  }),
  tests: many(tests)
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
  treeTestResults: many(treeTestResults)
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
  treeTestResults: many(treeTestResults)
}))
export const treeTestResultRelations = relations(treeTestResults, ({ one }) => ({
  testResult: one(testResults, {
    fields: [treeTestResults.testResultId],
    references: [testResults.id]
  })
}))
