import { cn } from '@/lib/utils'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'

export const CheckboxWithLabel = ({
  label,
  checked,
  className,
  onChange,
  name,
  disabled
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  name: string
  disabled?: boolean
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Checkbox
        id={name}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
      <Label htmlFor={name}>{label}</Label>
    </div>
  )
}
