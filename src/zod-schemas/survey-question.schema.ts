import { SURVEY_QUESTION_TYPE } from '@/utils/study-utils'

export const surveyQuestionTypes = [
  SURVEY_QUESTION_TYPE.SHORT_TEXT,
  SURVEY_QUESTION_TYPE.LONG_TEXT,
  SURVEY_QUESTION_TYPE.SINGLE_SELECT,
  SURVEY_QUESTION_TYPE.MULTIPLE_SELECT,
  SURVEY_QUESTION_TYPE.LINEAR_SCALE,
  SURVEY_QUESTION_TYPE.RANKING
] as const
export type SurveyQuestionType = (typeof surveyQuestionTypes)[number]
