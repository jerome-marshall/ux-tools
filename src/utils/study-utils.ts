import { type TestType } from '@/zod-schemas/test.schema'
import { ListTree, CircleHelp, FileQuestion, type LucideIcon } from 'lucide-react'

export const SECTION_TYPE = {
  STUDY_DETAILS: 'STUDY_DETAILS',
  WELCOME: 'WELCOME',
  THANK_YOU: 'THANK_YOU',
  TREE_TEST: 'TREE_TEST',
  SURVEY: 'SURVEY'
} as const

export const getIcon = (type: TestType): LucideIcon => {
  switch (type) {
    case SECTION_TYPE.TREE_TEST:
      return ListTree
    case SECTION_TYPE.SURVEY:
      return CircleHelp
    default:
      return FileQuestion
  }
}

export const SURVEY_QUESTION_TYPE = {
  SHORT_TEXT: 'short_text',
  LONG_TEXT: 'long_text',
  SINGLE_SELECT: 'single_select',
  MULTIPLE_SELECT: 'multiple_select',
  LINEAR_SCALE: 'linear_scale',
  RANKING: 'ranking'
} as const

export const surveyQuestionTypeOptions = [
  {
    label: 'Short Text',
    value: SURVEY_QUESTION_TYPE.SHORT_TEXT
  },
  {
    label: 'Long Text',
    value: SURVEY_QUESTION_TYPE.LONG_TEXT
  },
  {
    label: 'Single Select',
    value: SURVEY_QUESTION_TYPE.SINGLE_SELECT
  },
  {
    label: 'Multiple Select',
    value: SURVEY_QUESTION_TYPE.MULTIPLE_SELECT
  },
  {
    label: 'Ranking',
    value: SURVEY_QUESTION_TYPE.RANKING
  }
]
