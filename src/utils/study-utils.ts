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

export const SURVEY_QUESTION_TYPE_NAME = {
  [SURVEY_QUESTION_TYPE.SHORT_TEXT]: 'Short text',
  [SURVEY_QUESTION_TYPE.LONG_TEXT]: 'Long text',
  [SURVEY_QUESTION_TYPE.SINGLE_SELECT]: 'Single select',
  [SURVEY_QUESTION_TYPE.MULTIPLE_SELECT]: 'Multiple select',
  [SURVEY_QUESTION_TYPE.LINEAR_SCALE]: 'Linear scale',
  [SURVEY_QUESTION_TYPE.RANKING]: 'Ranking'
}

export const surveyQuestionTypeOptions = [
  {
    label: SURVEY_QUESTION_TYPE_NAME[SURVEY_QUESTION_TYPE.SHORT_TEXT],
    value: SURVEY_QUESTION_TYPE.SHORT_TEXT
  },
  {
    label: SURVEY_QUESTION_TYPE_NAME[SURVEY_QUESTION_TYPE.LONG_TEXT],
    value: SURVEY_QUESTION_TYPE.LONG_TEXT
  },
  {
    label: SURVEY_QUESTION_TYPE_NAME[SURVEY_QUESTION_TYPE.SINGLE_SELECT],
    value: SURVEY_QUESTION_TYPE.SINGLE_SELECT
  },
  {
    label: SURVEY_QUESTION_TYPE_NAME[SURVEY_QUESTION_TYPE.MULTIPLE_SELECT],
    value: SURVEY_QUESTION_TYPE.MULTIPLE_SELECT
  },
  {
    label: SURVEY_QUESTION_TYPE_NAME[SURVEY_QUESTION_TYPE.RANKING],
    value: SURVEY_QUESTION_TYPE.RANKING
  }
]
