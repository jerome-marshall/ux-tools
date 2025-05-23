import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { type ChoiceOption } from '@/types'
import { OTHER_PREFIX } from '@/utils/study-utils'
import { useRef, useState } from 'react'

interface SingleSelectProps {
  value: string | null
  onChange: (value: string) => void
  options: ChoiceOption[]
  hasOtherOption: boolean
}

export const SingleSelectRadioGroup = ({
  value,
  onChange,
  options,
  hasOtherOption
}: SingleSelectProps) => {
  return (
    <RadioGroup onValueChange={onChange} value={value ?? ''}>
      {options.map(option => (
        <RadioItem key={option.id} option={option} />
      ))}
      {hasOtherOption && <OtherOption value={value} onChange={onChange} />}
    </RadioGroup>
  )
}

const RadioItem = ({ option }: { option: ChoiceOption }) => {
  return (
    <div className='relative flex items-center space-x-2'>
      <RadioGroupItem
        value={option.value}
        id={option.id}
        className='peer absolute ml-3 data-[state=checked]:bg-teal-600 data-[state=checked]:text-teal-600 [&_svg]:fill-white [&_svg]:transition-all [&_svg]:duration-100'
      />
      <Label
        htmlFor={option.id}
        className='w-full cursor-pointer rounded-md border bg-white p-3 transition-all duration-100 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-500/10 peer-data-[state=checked]:text-teal-800'
      >
        <p className='pl-8 text-base font-medium'>{option.value}</p>
      </Label>
    </div>
  )
}

const OtherOption = ({
  value,
  onChange
}: {
  value: string | null
  onChange: (value: string) => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [otherText, setOtherText] = useState('')
  const isOtherSelected = value?.startsWith(OTHER_PREFIX) ?? false
  const otherValue = isOtherSelected ? (value?.replace(OTHER_PREFIX, '') ?? '') : ''

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    setOtherText(newText)
    onChange(`${OTHER_PREFIX}${newText}`)
  }

  const handleInputFocus = () => {
    if (!isOtherSelected) {
      onChange(`${OTHER_PREFIX}${otherText}`)
    }
  }

  return (
    <div className='relative flex items-center space-x-2'>
      <RadioGroupItem
        value={`${OTHER_PREFIX}${otherText}`}
        id='other-option'
        className='peer absolute ml-3 data-[state=checked]:bg-teal-600 data-[state=checked]:text-teal-600 [&_svg]:fill-white [&_svg]:transition-all [&_svg]:duration-100'
        onClick={() => inputRef.current?.focus()}
      />
      <Label
        htmlFor='other-option'
        className={`w-full cursor-pointer rounded-md border bg-white p-3 transition-all duration-100 ${
          isOtherSelected ? 'border-teal-600 bg-teal-500/10 text-teal-800' : ''
        }`}
      >
        <Input
          ref={inputRef}
          placeholder='Other'
          value={isOtherSelected ? otherValue : otherText}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          variant='teal'
          className='ml-8 h-auto rounded-none border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0'
        />
      </Label>
    </div>
  )
}
