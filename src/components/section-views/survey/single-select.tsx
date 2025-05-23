import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { type ChoiceOption } from '@/types'

interface SingleSelectProps {
  value: string | null
  onChange: (value: string) => void
  options: ChoiceOption[]
}

export const SingleSelectRadioGroup = ({
  value,
  onChange,
  options
}: SingleSelectProps) => {
  return (
    <RadioGroup onValueChange={onChange} value={value ?? ''}>
      {options.map(option => (
        <RadioItem key={option.id} option={option} />
      ))}
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
