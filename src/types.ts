import {
  type Project,
  type SurveyQuestion,
  type SurveyQuestionResult,
  type TestResult,
  type TreeTestResult
} from './server/db/schema'
import { type RouterOutputs } from './trpc/client'
import { type SECTION_TYPE } from './utils/study-utils'
import { type TestType } from './zod-schemas/test.schema'
import { type CorrectPath, type TreeItem } from './zod-schemas/tree.schema'

export type PathTypeStatus = `${'direct' | 'indirect'}-${'success' | 'failure' | 'pass'}`
export type CategorizedTreeResults = Record<PathTypeStatus, EntireTreeTestResult[]>

export type ProjectWithStudiesCount = Project & {
  studiesCount: number
}

export type StudyWithTests = RouterOutputs['studies']['getStudyById']

export type TestResultsWithTest = RouterOutputs['tests']['getTestResults']

export type EntireTreeTestResult = TreeTestResult & {
  testData: TestResult
}

export type SurveyQuestionWithAnswers = SurveyQuestion & {
  answers: SurveyQuestionResult[]
}

export type ChoiceOption = {
  id: string
  value: string
}

export type CombinedTestData = {
  id: string
  testId: string
  studyId: string
  name: string
  type: TestType
  randomized: boolean
  createdAt: Date
  updatedAt: Date
} & (
  | {
      type: typeof SECTION_TYPE.TREE_TEST
      treeStructure: TreeItem[]
      taskInstructions: string
      correctPaths: CorrectPath[]
    }
  | { type: typeof SECTION_TYPE.SURVEY; questions: SurveyQuestion[] }
)
