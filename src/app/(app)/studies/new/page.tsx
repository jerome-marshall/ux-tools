import StudyForm from '@/components/study/study-form'

export default function NewTestPage() {
  return (
    <StudyForm
      initialData={{
        study: {
          name: '',
          projectId: ''
        },
        tests: []
      }}
    />
  )
}
