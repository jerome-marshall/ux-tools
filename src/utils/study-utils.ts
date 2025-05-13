import { type TestType } from '@/zod-schemas/test.schema'
import { ListTree, CircleHelp, FileQuestion, type LucideIcon } from 'lucide-react'

export const SECTION_TYPE = {
  STUDY_DETAILS: 'STUDY_DETAILS',
  WELCOME: 'WELCOME',
  THANK_YOU: 'THANK_YOU',
  TREE_TEST: 'TREE_TEST',
  SURVEY: 'SURVEY'
} as const

export const getIcon = (type: TestType): LucideIcon => {
  switch (type) {
    case SECTION_TYPE.TREE_TEST:
      return ListTree
    case SECTION_TYPE.SURVEY:
      return CircleHelp
    default:
      return FileQuestion
  }
}
