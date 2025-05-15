import { db } from '@/server/db'
import { surveyQuestions, type SurveyQuestionInsert } from '@/server/db/schema'
import { eq, inArray } from 'drizzle-orm'

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
