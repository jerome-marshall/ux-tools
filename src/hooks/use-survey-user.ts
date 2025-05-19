import { generateId } from '@/lib/utils'
import { useLocalStorage } from 'usehooks-ts'
import { useEffect } from 'react'

export const useSurveyUser = ({ isPreview }: { isPreview: boolean }) => {
  const [storedUserId, setStoredUserId] = useLocalStorage('survey-user-id', '')
  const userId = isPreview ? '' : storedUserId

  useEffect(() => {
    if (!isPreview && !userId) {
      const generatedId = generateId()
      setStoredUserId(generatedId)
    }
  }, [isPreview, userId, setStoredUserId])

  return { userId }
}
