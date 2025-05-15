import {
  deleteSurveyQuestionsByIds,
  deleteSurveyQuestionsByTestId,
  getSurveyQuestionsByTestId,
  insertSurveyQuestion,
  insertSurveyQuestions,
  updateSurveyQuestionById
} from '@/data-access/survey-questions'
import { type Db } from '@/server/db'

import { type SurveyQuestionInsert } from '@/server/db/schema'

export const insertSurveyQuestionUseCase = async (
  surveyQuestion: SurveyQuestionInsert,
  trx?: Db
) => {
  const result = await insertSurveyQuestion(surveyQuestion, trx)
  return result
}

export const insertSurveyQuestionsUseCase = async (
  surveyQuestionsData: SurveyQuestionInsert[],
  trx?: Db
) => {
  const result = await insertSurveyQuestions(surveyQuestionsData, trx)
  return result
}

export const getSurveyQuestionsByTestIdUseCase = async (testId: string, trx?: Db) => {
  const result = await getSurveyQuestionsByTestId(testId, trx)
  return result
}

export const updateSurveyQuestionByIdUseCase = async (
  id: string,
  surveyQuestionData: Partial<SurveyQuestionInsert>,
  trx?: Db
) => {
  const result = await updateSurveyQuestionById(id, surveyQuestionData, trx)
  return result
}

export const deleteSurveyQuestionsByIdsUseCase = async (ids: string[], trx?: Db) => {
  const result = await deleteSurveyQuestionsByIds(ids, trx)
  return result
}

export const deleteSurveyQuestionsByTestIdUseCase = async (testId: string, trx?: Db) => {
  const result = await deleteSurveyQuestionsByTestId(testId, trx)
  return result
}
