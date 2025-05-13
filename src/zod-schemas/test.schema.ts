export const testTypes = ['TREE_TEST', 'SURVEY'] as const
export type TestType = (typeof testTypes)[number]
