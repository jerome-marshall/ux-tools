import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SURVEY_QUESTION_TYPE } from '@/utils/study-utils'

interface TextInputProps {
  type: typeof SURVEY_QUESTION_TYPE.SHORT_TEXT | typeof SURVEY_QUESTION_TYPE.LONG_TEXT
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const TextInput = ({
  type,
  value,
  onChange,
  placeholder = 'Enter your answer'
}: TextInputProps) => {
  if (type === SURVEY_QUESTION_TYPE.SHORT_TEXT) {
    return (
      <Input
        placeholder={placeholder}
        variant='teal'
        className='bg-white !text-base'
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  if (type === SURVEY_QUESTION_TYPE.LONG_TEXT) {
    return (
      <Textarea
        placeholder={placeholder}
        variant='teal'
        className='h-24 bg-white !text-base'
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  return null
}
