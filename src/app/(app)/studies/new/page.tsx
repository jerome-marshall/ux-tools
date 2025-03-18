import { CreateStudyForm } from '@/components/study/study-form'
import { generateId } from '@/lib/utils'

export default function NewTestPage() {
  return (
    <CreateStudyForm
      initialData={{
        study: {
          name: '',
          projectId: '',
          id: generateId(),
          testsOrder: []
        },
        tests: []
      }}
    />
  )
}
