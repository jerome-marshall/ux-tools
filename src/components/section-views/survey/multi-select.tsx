import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type ChoiceOption } from '@/types'
import { OTHER_PREFIX } from '@/utils/study-utils'
import { useRef, useState } from 'react'

interface MultiSelectProps {
  values: string[]
  onChange: (value: string[]) => void
  options: ChoiceOption[]
  hasOtherOption: boolean
}

export const MultiSelectCheckboxGroup = ({
  values,
  onChange,
  options,
  hasOtherOption
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

  const handleOtherChange = (newOtherValue: string) => {
    // Remove any existing other: value and add the new one
    const filteredOptions = selectedOptions.filter(v => !v.startsWith(OTHER_PREFIX))
    const newSelectedOptions = newOtherValue
      ? [...filteredOptions, `${OTHER_PREFIX}${newOtherValue}`]
      : filteredOptions

    setSelectedOptions(newSelectedOptions)
    onChange(newSelectedOptions)
  }

  const handleOtherToggle = () => {
    const hasOtherOption = selectedOptions.some(v => v.startsWith(OTHER_PREFIX))
    if (hasOtherOption) {
      // Remove other option
      const filteredOptions = selectedOptions.filter(v => !v.startsWith(OTHER_PREFIX))
      setSelectedOptions(filteredOptions)
      onChange(filteredOptions)
    } else {
      // Add empty other option
      const newSelectedOptions = [...selectedOptions, OTHER_PREFIX]
      setSelectedOptions(newSelectedOptions)
      onChange(newSelectedOptions)
    }
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
      {hasOtherOption && (
        <OtherOption
          values={selectedOptions}
          onOtherChange={handleOtherChange}
          onOtherToggle={handleOtherToggle}
        />
      )}
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

const OtherOption = ({
  values,
  onOtherChange,
  onOtherToggle
}: {
  values: string[]
  onOtherChange: (newOtherValue: string) => void
  onOtherToggle: () => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const otherValue = values.find(v => v.startsWith(OTHER_PREFIX))
  const isOtherSelected = !!otherValue
  const currentOtherText = isOtherSelected
    ? (otherValue?.replace(OTHER_PREFIX, '') ?? '')
    : ''

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    onOtherChange(newText)
  }

  const handleInputFocus = () => {
    if (!isOtherSelected) {
      // Add empty other option when focusing
      onOtherToggle()
    }
  }

  return (
    <div className='relative flex items-center space-x-2'>
      <Checkbox
        checked={isOtherSelected}
        onCheckedChange={onOtherToggle}
        id='other-option'
        className='peer absolute ml-3 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 [&_svg]:transition-all [&_svg]:duration-100'
      />
      <Label
        htmlFor='other-option'
        className={`w-full cursor-pointer rounded-md border bg-white p-3 transition-all duration-100 ${
          isOtherSelected ? 'border-teal-600 bg-teal-500/10 text-teal-800' : ''
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        <Input
          ref={inputRef}
          placeholder='Other'
          value={currentOtherText}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          variant='teal'
          className='ml-8 h-auto rounded-none border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0'
        />
      </Label>
    </div>
  )
}
