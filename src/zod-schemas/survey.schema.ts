export const surveyQuestionTypes = [
  'short_text',
  'long_text',
  'single_select',
  'multiple_select',
  'linear_scale',
  'ranking'
] as const
export type SurveyQuestionType = (typeof surveyQuestionTypes)[number]
