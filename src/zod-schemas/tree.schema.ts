import { z } from 'zod'

interface TreeItemType {
  id: string
  name: string
  children: TreeItemType[]
  parentId?: string
}
export const treeItemSchema: z.ZodType<TreeItemType> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    children: z.array(treeItemSchema),
    parentId: z.string().optional()
  })
)

export type TreeItem = z.infer<typeof treeItemSchema>

export const correctPathSchema = z.object({
  id: z.string(),
  path: z.array(z.string())
})
export type CorrectPath = z.infer<typeof correctPathSchema>

export const treeTestClickSchema = z.object({
  nodeId: z.string(),
  milliseconds: z.number()
})
export type TreeTestClick = z.infer<typeof treeTestClickSchema>
