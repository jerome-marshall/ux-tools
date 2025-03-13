import { cn } from '@/lib/utils'
import { type TreeItem } from '@/zod-schemas/tree.schema'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const TreeTestView = ({
  treeStructure,
  taskInstructions,
  onNextStep
}: {
  treeStructure: TreeItem[]
  taskInstructions: string
  onNextStep: () => void
}) => {
  const handleNext = (passed: boolean, path: string[]) => {
    // TODO: Implement the logic to handle the next step
  }

  return (
    <div className='relative flex h-full flex-col items-center p-10'>
      <div className=''>
        <h3 className='text-center text-xl font-medium'>{taskInstructions}</h3>
        <p className='mt-2 text-center text-gray-500'>
          Select an option from the menu below
        </p>
      </div>
      <div className='mt-10'>
        <TreeView treeStructure={treeStructure} onNextStep={onNextStep} />
      </div>

      {/* Pass button */}
      <button
        onClick={onNextStep}
        className='absolute right-6 bottom-6 rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300'
      >
        I'm not sure, pass
      </button>
    </div>
  )
}

const TreeView = ({
  treeStructure,
  onNextStep
}: {
  treeStructure: TreeItem[]
  onNextStep: () => void
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set())
  const [navigationPath, setNavigationPath] = useState<string[]>([])
  console.log('🚀 ~ TreeView ~ navigationPath:', navigationPath)

  // Function to get all valid ancestors of a node
  const getNodeAncestors = (tree: TreeItem[], nodeId: string): string[] => {
    const ancestors: string[] = []

    // Helper function to traverse the tree
    const findNodeAndCollectAncestors = (
      nodes: TreeItem[],
      targetId: string,
      currentPath: string[] = []
    ): boolean => {
      for (const node of nodes) {
        // Check if this is the target node
        if (node.id === targetId) {
          ancestors.push(...currentPath)
          return true
        }

        // Check children
        if (node.children && node.children.length > 0) {
          const found = findNodeAndCollectAncestors(node.children, targetId, [
            ...currentPath,
            node.id
          ])
          if (found) return true
        }
      }

      return false
    }

    findNodeAndCollectAncestors(tree, nodeId)
    return ancestors
  }

  // Function to find node name by ID
  const findNodeName = (nodes: TreeItem[], nodeId: string): string | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node.name
      if (node.children && node.children.length > 0) {
        const found = findNodeName(node.children, nodeId)
        if (found) return found
      }
    }
    return null
  }

  // Function to find all siblings of a node with the same parent
  const getNodeSiblings = (
    tree: TreeItem[],
    nodeId: string,
    parentId?: string
  ): string[] => {
    const siblings: string[] = []

    // If no parent, this is a root node - get other roots
    if (!parentId) {
      return tree.filter(item => item.id !== nodeId).map(item => item.id)
    }

    // Find parent node to get siblings
    const findParentAndGetSiblings = (nodes: TreeItem[]): boolean => {
      for (const node of nodes) {
        // Check if this is the parent node
        if (node.id === parentId) {
          // Found the parent, collect all siblings except the target
          node.children
            .filter(child => child.id !== nodeId)
            .forEach(child => siblings.push(child.id))
          return true
        }

        // Check children if not found
        if (node.children && node.children.length > 0) {
          const found = findParentAndGetSiblings(node.children)
          if (found) return true
        }
      }

      return false
    }

    findParentAndGetSiblings(tree)
    return siblings
  }

  // Get all descendants of a node (for removing them from expanded set)
  const getAllDescendants = (tree: TreeItem[], nodeIds: string[]): string[] => {
    const descendants: string[] = []

    // Helper to get descendants of a single node
    const getDescendantsForNode = (nodes: TreeItem[], nodeId: string): void => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          // Found the node, collect all descendants
          const collectDescendants = (n: TreeItem) => {
            if (n.children && n.children.length > 0) {
              n.children.forEach(child => {
                descendants.push(child.id)
                collectDescendants(child)
              })
            }
          }
          collectDescendants(node)
          return
        }

        // Check children if not found
        if (node.children && node.children.length > 0) {
          getDescendantsForNode(node.children, nodeId)
        }
      }
    }

    // Get descendants for each node ID
    nodeIds.forEach(id => getDescendantsForNode(tree, id))
    return descendants
  }

  const handleNodeSelection = (nodeId: string, parentId?: string) => {
    // Always select the node
    setSelectedNodeId(nodeId)

    // Update the navigation path - append to history instead of replacing
    setNavigationPath(prev => {
      // Add current node to the history path
      return [...prev, nodeId]
    })

    // Update expanded nodes
    setExpandedNodeIds(prev => {
      const newSet = new Set(prev)
      const nodeAncestors = getNodeAncestors(treeStructure, nodeId)

      // Logic for root nodes is simpler
      if (!parentId) {
        // Clear all expanded nodes except this one
        return new Set([nodeId])
      }

      // This is a child node

      // 1. Ensure all ancestors stay expanded
      nodeAncestors.forEach(id => newSet.add(id))

      // 2. Find all siblings of this node
      const siblings = getNodeSiblings(treeStructure, nodeId, parentId)

      // 3. Get all descendants of these siblings to also remove
      const siblingsAndDescendants = [
        ...siblings,
        ...getAllDescendants(treeStructure, siblings)
      ]

      // 4. Remove siblings and their descendants from expanded set
      siblingsAndDescendants.forEach(id => newSet.delete(id))

      // 5. Ensure this node is expanded
      newSet.add(nodeId)

      return newSet
    })
  }

  return (
    <div className='w-[620px]'>
      {/* Navigation History */}
      {navigationPath.length > 0 && (
        <div className='mb-4 overflow-x-auto'>
          <div className='mb-1 font-medium text-gray-700'>Navigation History:</div>
          <div className='flex flex-wrap items-center rounded-md bg-gray-50 p-2 text-sm text-gray-500'>
            {navigationPath.map((id, index) => {
              const nodeName = findNodeName(treeStructure, id) ?? id

              return (
                <span key={`${id}-${index}`} className='flex items-center'>
                  {index > 0 && <span className='mx-1'>→</span>}
                  <span
                    className={cn(
                      'rounded px-2 py-1',
                      selectedNodeId === id ? 'bg-teal-500 text-white' : 'bg-gray-100'
                    )}
                  >
                    {nodeName}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {treeStructure.map(item => (
        <TreeItem
          key={item.id}
          item={item}
          parentId={undefined}
          selectedNodeId={selectedNodeId}
          expandedNodeIds={expandedNodeIds}
          onSelect={handleNodeSelection}
          onNextStep={onNextStep}
        />
      ))}
    </div>
  )
}

const TreeItem = ({
  item,
  parentId,
  selectedNodeId,
  expandedNodeIds,
  onSelect,
  onNextStep
}: {
  item: TreeItem
  parentId?: string
  selectedNodeId: string | null
  expandedNodeIds: Set<string>
  onSelect: (id: string, parentId?: string) => void
  onNextStep: () => void
}) => {
  const hasChildren = item.children && item.children.length > 0
  const isSelected = selectedNodeId === item.id
  const isExpanded = expandedNodeIds.has(item.id)

  const handleSelect = () => {
    onSelect(item.id, parentId)
  }

  return (
    <div>
      <div
        className={cn(
          'my-1 flex cursor-pointer items-center rounded-md bg-white p-2 shadow-sm',
          isSelected ? 'bg-teal-500 text-white' : ''
        )}
        onClick={handleSelect}
      >
        {hasChildren && (
          <div className='mr-2 flex h-6 w-6 items-center justify-center text-gray-400'>
            <span
              className={`transform transition-transform ${isSelected ? 'text-white' : ''}`}
            >
              {isExpanded ? <ChevronDown /> : <ChevronRight />}
            </span>
          </div>
        )}
        {!hasChildren && <div className='mr-2 w-6' />}
        <span>{item.name}</span>

        {isSelected && (
          <div className='ml-auto'>
            <button
              className='rounded-md bg-teal-600 px-4 py-1 text-white'
              onClick={e => {
                e.stopPropagation()
                onNextStep()
              }}
            >
              I'd find it here
            </button>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className='ml-6 border-l border-gray-200 pl-4'>
          {item.children.map(child => (
            <TreeItem
              key={child.id}
              item={child}
              parentId={item.id}
              selectedNodeId={selectedNodeId}
              expandedNodeIds={expandedNodeIds}
              onSelect={onSelect}
              onNextStep={onNextStep}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TreeTestView
