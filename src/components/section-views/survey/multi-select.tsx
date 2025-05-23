import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { type ChoiceOption } from '@/types'
import { useState } from 'react'

interface MultiSelectProps {
  values: string[]
  onChange: (value: string[]) => void
  options: ChoiceOption[]
}

export const MultiSelectCheckboxGroup = ({
  values,
  onChange,
  options
}: MultiSelectProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(values)

  const handleSelect = (option: string) => {
    const hasOption = selectedOptions.includes(option)
    const newSelectedOptions = hasOption
      ? selectedOptions.filter(o => o !== option)
      : [...selectedOptions, option]

    setSelectedOptions(newSelectedOptions)
    onChange(newSelectedOptions)
  }

  return (
    <div className='grid gap-3'>
      {options.map(option => (
        <CheckboxItem
          key={option.id}
          option={option}
          onSelect={handleSelect}
          isSelected={selectedOptions.includes(option.value)}
        />
      ))}
    </div>
  )
}

const CheckboxItem = ({
  option,
  onSelect,
  isSelected
}: {
  option: ChoiceOption
  onSelect: (value: string) => void
  isSelected: boolean
}) => {
  return (
    <div className='relative flex items-center space-x-2'>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(option.value)}
        id={option.id}
        className='peer absolute ml-3 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 [&_svg]:transition-all [&_svg]:duration-100'
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
