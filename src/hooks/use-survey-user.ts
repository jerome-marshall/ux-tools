import { useLocalStorage } from 'usehooks-ts'

export const useSurveyUser = ({ isPreview }: { isPreview: boolean }) => {
  const [storedUserId] = useLocalStorage('user-id', '')
  const userId = isPreview ? '' : storedUserId

  return { userId }
}
