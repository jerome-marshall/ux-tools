import { type PathTypeStatus } from '@/types'
import { type TreeTestClick, type TreeItem } from '@/zod-schemas/tree.schema'

export const PATH_TYPE: Record<
  PathTypeStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  'direct-success': {
    label: 'DIRECT SUCCESS',
    bgColor: 'bg-green-600',
    textColor: 'text-green-50'
  },
  'direct-failure': {
    label: 'DIRECT FAILURE',
    bgColor: 'bg-red-600',
    textColor: 'text-red-50'
  },
  'direct-pass': {
    label: 'DIRECT PASS',
    bgColor: 'bg-gray-600',
    textColor: 'text-gray-50'
  },
  'indirect-success': {
    label: 'INDIRECT SUCCESS',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  'indirect-failure': {
    label: 'INDIRECT FAILURE',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  'indirect-pass': {
    label: 'INDIRECT PASS',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700'
  }
}

export function getNodePathTypeStatus(
  clicks: TreeTestClick[],
  treeStructure: TreeItem[],
  correctNodeIds: string[],
  passed: boolean
): PathTypeStatus {
  if (!clicks || clicks.length === 0) {
    return 'direct-pass'
  }

  const hasBacktracked = checkBacktrack(clicks, treeStructure)
  const lastClickedNodeId = clicks[clicks.length - 1]?.nodeId

  if (!lastClickedNodeId) {
    return 'direct-failure'
  }

  if (passed) {
    return hasBacktracked ? 'indirect-pass' : 'direct-pass'
  }

  const isCorrect = correctNodeIds.includes(lastClickedNodeId)

  if (isCorrect) {
    return hasBacktracked ? 'indirect-success' : 'direct-success'
  }

  return hasBacktracked ? 'indirect-failure' : 'direct-failure'
}

// Helper function to check if an item is a descendant of another item
export function isDescendant(parent: TreeItem, childId: string): boolean {
  // Check direct children
  for (const child of parent.children) {
    if (child.id === childId) {
      return true
    }

    // Check descendants recursively
    if (isDescendant(child, childId)) {
      return true
    }
  }

  return false
}

// Find an item by ID
export function findItemById(items: TreeItem[], id: string): TreeItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item
    }

    if (item.children.length > 0) {
      const found = findItemById(item.children, id)
      if (found) return found
    }
  }

  return null
}

// Helper function to get node name by ID
export function getNodeNameById(items: TreeItem[], nodeId: string): string {
  const findName = (items: TreeItem[]): string | null => {
    for (const item of items) {
      if (item.id === nodeId) {
        return item.name || item.id
      }

      if (item.children.length > 0) {
        const foundName = findName(item.children)
        if (foundName !== null) return foundName
      }
    }
    return null
  }

  const result = findName(items)
  return result ?? nodeId // Fallback to ID if name not found
}

// Get node path as array of IDs
export function getNodePath(items: TreeItem[], nodeId: string): string[] {
  const path: string[] = []

  // Recursive function to build path
  const buildPath = (
    items: TreeItem[],
    id: string,
    currentPath: string[] = []
  ): boolean => {
    for (const item of items) {
      // Current path including this item's ID
      const itemPath = [...currentPath, item.id]

      // If this is the node we're looking for
      if (item.id === id) {
        path.push(...itemPath)
        return true
      }

      // Check children
      if (item.children.length > 0) {
        if (buildPath(item.children, id, itemPath)) {
          return true
        }
      }
    }

    return false
  }

  buildPath(items, nodeId, [])
  return path
}

export function getNodeHierarchyLevel(items: TreeItem[], nodeId: string): number {
  const path = getNodePath(items, nodeId)
  return path.length
}

/**
 * Checks if the user has backtracked in tree navigation based on click history
 * @param clicks Array of tree test clicks containing nodeId and milliseconds
 * @param treeStructure The tree structure used for navigation
 * @returns boolean indicating whether backtracking occurred
 */
export function checkBacktrack(
  clicks: TreeTestClick[],
  treeStructure: TreeItem[]
): boolean {
  // If we have fewer than 2 clicks, there can't be backtracking
  if (clicks.length < 2) {
    return false
  }

  // Build a map of each node's location in the tree (parent-child relationships)
  const nodeMap = buildNodeMap(treeStructure)

  // Track all visited nodes
  const visitedNodes = new Set<string>()
  visitedNodes.add(clicks[0].nodeId)

  // Track the root node for each click
  const rootForNode = new Map<string, string>()

  // Build a map of each node to its root node
  for (const item of treeStructure) {
    mapNodesToRoot(item, item.id, rootForNode)
  }

  // For each click after the first, check if it represents backtracking
  for (let i = 1; i < clicks.length; i++) {
    const currentNodeId = clicks[i].nodeId
    const previousNodeId = clicks[i - 1].nodeId

    // Skip invalid node IDs
    if (!currentNodeId || !previousNodeId) {
      continue
    }

    // Check if returning to any previously visited node
    if (visitedNodes.has(currentNodeId)) {
      return true
    }

    // Add current node to visited set
    visitedNodes.add(currentNodeId)

    // Check if moving to a different root-level branch
    const currentRoot = rootForNode.get(currentNodeId)
    const previousRoot = rootForNode.get(previousNodeId)

    // If we can't determine the roots (node not in tree), we can't say it's backtracking
    // based on root changes, so we skip this check
    if (currentRoot && previousRoot && currentRoot !== previousRoot) {
      // Switching between different top-level sections is considered backtracking
      return true
    }

    // Check if moving to an ancestor (original logic)
    // Only perform this check if both nodes exist in the nodeMap
    if (
      nodeMap.has(currentNodeId) &&
      nodeMap.has(previousNodeId) &&
      isAncestor(currentNodeId, previousNodeId, nodeMap)
    ) {
      return true
    }
  }

  return false
}

/**
 * Helper function to map each node to its root node
 */
function mapNodesToRoot(node: TreeItem, rootId: string, rootMap: Map<string, string>) {
  rootMap.set(node.id, rootId)

  for (const child of node.children) {
    mapNodesToRoot(child, rootId, rootMap)
  }
}

/**
 * Builds a map of node relationships in the tree
 * @param treeItems The tree structure
 * @returns A map where keys are node IDs and values are their parent node IDs
 */
function buildNodeMap(treeItems: TreeItem[]): Map<string, string | undefined> {
  const nodeMap = new Map<string, string | undefined>()

  function traverse(items: TreeItem[], parentId?: string) {
    for (const item of items) {
      nodeMap.set(item.id, parentId)
      if (item.children.length > 0) {
        traverse(item.children, item.id)
      }
    }
  }

  traverse(treeItems)
  return nodeMap
}

/**
 * Checks if potentialAncestor is an ancestor of nodeId in the tree
 * @param potentialAncestor ID of the node that might be an ancestor
 * @param nodeId ID of the node to check
 * @param nodeMap Map of node relationships
 * @returns boolean indicating whether potentialAncestor is an ancestor of nodeId
 */
function isAncestor(
  potentialAncestor: string,
  nodeId: string,
  nodeMap: Map<string, string | undefined>
): boolean {
  let currentId = nodeId
  let parentId = nodeMap.get(currentId)

  // Traverse up the tree until we reach the root
  while (parentId !== undefined) {
    // If the current parent is the potential ancestor, return true
    if (parentId === potentialAncestor) {
      return true
    }

    // Move up to the next level
    currentId = parentId
    parentId = nodeMap.get(currentId)
  }

  return false
}
