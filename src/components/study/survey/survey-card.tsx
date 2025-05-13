import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { type UseFormReturn } from 'react-hook-form'
import StudyFormSectionCard from '../study-form-section-card'
import { CircleHelp } from 'lucide-react'
import { SurveyQuestion } from './survey-question'

export const SurveyCard = ({
  form,
  index,
  onRemoveSection,
  disableFields
}: {
  form: UseFormReturn<StudyWithTestsInsert>
  index: number
  onRemoveSection: (index: number) => void
  disableFields: boolean
}) => {
  return (
    <StudyFormSectionCard
      Icon={CircleHelp}
      form={form}
      index={index}
      disableFields={disableFields}
      onRemoveSection={onRemoveSection}
      content={<SurveyQuestion disableFields={disableFields} />}
    />
  )
}
