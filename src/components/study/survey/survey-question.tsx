import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { SURVEY_QUESTION_TYPE, surveyQuestionTypeOptions } from '@/utils/study-utils'
import { GripVertical, Trash, Trash2 } from 'lucide-react'

export const SurveyQuestion = ({ disableFields }: { disableFields: boolean }) => {
  return (
    <div className='grid gap-6 rounded-md border p-4'>
      <div className='flex items-center justify-between'>
        <p className=''>1.1. Single select question</p>
        <div>
          <Button variant='destructive' size='icon' disabled={disableFields}>
            <Trash className='size-4' />
          </Button>
        </div>
      </div>

      <div className='grid'>
        <p className='mb-2'>Question</p>
        <div className='flex items-center gap-2'>
          <GripVertical className='size-6' />
          <Input className='flex-1' />
          <Select defaultValue={SURVEY_QUESTION_TYPE.SINGLE_SELECT}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select a question type' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {surveyQuestionTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className='ml-2 flex items-center gap-2'>
            <Label htmlFor='required'>Required</Label>
            <Switch id='required' />
          </div>
        </div>
      </div>

      <div className='grid'>
        <p className='mb-2'>Choices (Press ⏎ for new line or paste a list)</p>
        <div className='grid gap-4'>
          <Choice />
          <Choice />
          <Choice />
        </div>
        <Button size='sm' type='button' className='mt-4 ml-8 w-fit'>
          Add another choice
        </Button>
      </div>

      <div className='ml-8 grid gap-3'>
        <div className='flex items-center gap-2'>
          <Checkbox id='show_other' />
          <Label htmlFor='show_other'>Show “Other” option</Label>
        </div>
        <div className='flex items-center gap-2'>
          <Checkbox id='randomize' />
          <Label htmlFor='randomize'>Randomize the order of choices</Label>
        </div>
      </div>
    </div>
  )
}

const Choice = () => {
  return (
    <div className='flex items-center gap-2'>
      <GripVertical className='size-6' />
      <Input className='flex-1' />
      <Button variant='ghost' type='button' size='icon'>
        <Trash2 className='size-4' />
      </Button>
    </div>
  )
}
