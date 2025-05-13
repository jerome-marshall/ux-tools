import { SECTION_TYPE } from '@/utils/study-utils'

export const testTypes = [SECTION_TYPE.TREE_TEST, SECTION_TYPE.SURVEY] as const
export type TestType = (typeof testTypes)[number]
