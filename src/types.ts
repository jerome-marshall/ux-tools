import { type Project, type TreeTestResult, type TestResult } from './server/db/schema'
import { type RouterOutputs } from './trpc/client'

export type ProjectWithStudiesCount = Project & {
  studiesCount: number
}

export type StudyWithTests = RouterOutputs['studies']['getStudyById']

export type TestResultsWithTest = RouterOutputs['tests']['getTestResults']

export type EntireTreeTestResult = TreeTestResult & {
  testData: TestResult
}
