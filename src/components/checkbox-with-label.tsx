import { cn } from '@/lib/utils'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

export const CheckboxWithLabel = ({
  label,
  id,
  checked,
  className,
  onChange
}: {
  label: string
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}
