import { db } from '@/server/db'
import {
  type SurveyQuestionResultInsert,
  surveyQuestionResults,
  surveyQuestions,
  type SurveyQuestionInsert
} from '@/server/db/schema'
import { asc, eq, inArray } from 'drizzle-orm'

export const insertSurveyQuestion = async (
  surveyQuestion: SurveyQuestionInsert,
  trx = db
) => {
  const [result] = await trx.insert(surveyQuestions).values(surveyQuestion).returning()
  return result
}

export const insertSurveyQuestions = async (
  surveyQuestionsData: SurveyQuestionInsert[],
  trx = db
) => {
  const results = await trx
    .insert(surveyQuestions)
    .values(surveyQuestionsData)
    .returning()
  return results
}

export const getSurveyQuestionsByTestId = async (testId: string, trx = db) => {
  const results = await trx
    .select()
    .from(surveyQuestions)
    .where(eq(surveyQuestions.testId, testId))
    .orderBy(asc(surveyQuestions.position))
  return results
}

export const updateSurveyQuestionById = async (
  id: string,
  surveyQuestionData: Partial<SurveyQuestionInsert>,
  trx = db
) => {
  const results = await trx
    .update(surveyQuestions)
    .set(surveyQuestionData)
    .where(eq(surveyQuestions.id, id))
    .returning()
  return results
}

export const deleteSurveyQuestionsByIds = async (ids: string[], trx = db) => {
  const results = await trx
    .delete(surveyQuestions)
    .where(inArray(surveyQuestions.id, ids))
    .returning()
  return results
}

export const deleteSurveyQuestionsByTestId = async (testId: string, trx = db) => {
  const results = await trx
    .delete(surveyQuestions)
    .where(eq(surveyQuestions.testId, testId))
    .returning()
  return results
}

export const getSurveyQuestionResultsByTestId = async (testId: string, trx = db) => {
  const results = await trx
    .select()
    .from(surveyQuestionResults)
    .where(eq(surveyQuestionResults.testId, testId))
  return results
}

export const getSurveyQuestionResultsByTestResultId = async (
  testResultId: string,
  trx = db
) => {
  const results = await trx
    .select()
    .from(surveyQuestionResults)
    .where(eq(surveyQuestionResults.testResultId, testResultId))
  return results
}

export const getSurveyQuestionResultsByTestResultIds = async (
  testResultIds: string[],
  trx = db
) => {
  const results = await trx
    .select()
    .from(surveyQuestionResults)
    .where(inArray(surveyQuestionResults.testResultId, testResultIds))
  return results
}

export const insertSurveyQuestionResult = async (
  surveyQuestionResult: SurveyQuestionResultInsert,
  trx = db
) => {
  const [result] = await trx
    .insert(surveyQuestionResults)
    .values(surveyQuestionResult)
    .returning()
  return result
}

export const insertSurveyQuestionResults = async (
  surveyQuestionResultsData: SurveyQuestionResultInsert[],
  trx = db
) => {
  const results = await trx
    .insert(surveyQuestionResults)
    .values(surveyQuestionResultsData)
    .returning()
  return results
}

export const deleteSurveyQuestionResultsByIds = async (ids: string[], trx = db) => {
  const results = await trx
    .delete(surveyQuestionResults)
    .where(inArray(surveyQuestionResults.id, ids))
    .returning()
  return results
}
