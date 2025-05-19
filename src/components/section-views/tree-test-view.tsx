import { cn } from '@/lib/utils'
import { type TreeItem, type TreeTestClick } from '@/zod-schemas/tree.schema'
import { ChevronDown, ChevronRight } from 'lucide-react'
import * as motion from 'motion/react-client'
import { useState } from 'react'
import { Button } from '../ui/button'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useLocalStorage } from 'usehooks-ts'
import { SECTION_TYPE } from '@/utils/study-utils'
import { TestViewLayout } from './test-view-layout'
import { useSurveyUser } from '@/hooks/use-survey-user'

const TreeTestView = ({
  treeStructure,
  taskInstructions,
  onNextStep,
  testId,
  isPreview
}: {
  treeStructure: TreeItem[]
  taskInstructions: string
  testId: string
  isPreview: boolean
  onNextStep: () => void
}) => {
  const trpc = useTRPC()

  const { userId } = useSurveyUser({ isPreview })

  const [startTime, setStartTime] = useState<number>(Date.now())
  const [firstInteractionTime, setFirstInteractionTime] = useState<number | null>(null)

  const { mutate } = useMutation(trpc.tests.createTestResult.mutationOptions())

  const handleNext = (passed: boolean, path: TreeTestClick[]) => {
    const now = Date.now()
    const totalDurationMs = now - startTime
    const taskDurationMs = firstInteractionTime ? now - firstInteractionTime : 0

    setStartTime(now)
    setFirstInteractionTime(null)

    if (!isPreview) {
      mutate({
        testType: SECTION_TYPE.TREE_TEST,
        testId,
        userId,
        totalDurationMs,
        taskDurationMs,
        treeTestResult: { passed, testId, treeTestClicks: path }
      })
    }

    onNextStep()
  }

  return (
    <TestViewLayout
      title={taskInstructions}
      description={'Select an option from the menu below'}
      wrapperClassName='max-w-xl'
    >
      <TreeView
        treeStructure={treeStructure}
        onNextStep={handleNext}
        firstInteractionTime={firstInteractionTime}
        setFirstInteractionTime={setFirstInteractionTime}
      />
    </TestViewLayout>
  )
}

const TreeView = ({
  treeStructure,
  onNextStep,
  firstInteractionTime,
  setFirstInteractionTime
}: {
  treeStructure: TreeItem[]
  onNextStep: (passed: boolean, navigationPath: TreeTestClick[]) => void
  firstInteractionTime: number | null
  setFirstInteractionTime: (time: number) => void
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set())
  const [navigationPath, setNavigationPath] = useState<TreeTestClick[]>([])
  const [lastClickTime, setLastClickTime] = useState<number>(Date.now())

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
    const now = Date.now()

    // Record first interaction time if not set yet
    if (!firstInteractionTime) {
      setFirstInteractionTime(now)
    }

    // Always select the node
    setSelectedNodeId(nodeId)

    // Update the navigation path - but don't add it if it's already selected
    setNavigationPath(prev => {
      // Check if this node is already the last one in the path
      if (prev.length > 0 && prev[prev.length - 1].nodeId === nodeId) {
        return prev // Return unchanged if already the last selected
      }

      // Calculate time since last click
      const timeAfterPreviousMs = now - lastClickTime

      // Update the last click time
      setLastClickTime(now)

      // Add current node to the history path with timing info
      return [...prev, { nodeId, milliseconds: timeAfterPreviousMs }]
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
    <>
      <div className='w-full'>
        {/* Navigation History */}
        {/* {navigationPath.length > 0 && (
        <motion.div
          className='mb-4 overflow-x-auto'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className='mb-1 font-medium text-gray-700'>Navigation History:</div>
          <div className='flex flex-wrap items-center rounded-md bg-gray-50 p-2 text-sm text-gray-500'>
            {navigationPath.map((item, index) => {
              const nodeName = findNodeName(treeStructure, item.nodeId) ?? item.nodeId

              return (
                <motion.span
                  key={`${item.nodeId}-${index}`}
                  className='flex items-center'
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {index > 0 && <span className='mx-1'>→</span>}
                  <span
                    className={cn(
                      'rounded px-2 py-1',
                      selectedNodeId === item.nodeId ? 'bg-teal-500 text-white' : 'bg-gray-100'
                    )}
                  >
                    {nodeName}
                  </span>
                </motion.span>
              )
            })}
          </div>
        </motion.div>
      )} */}

        {treeStructure.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <TreeItem
              item={item}
              parentId={undefined}
              selectedNodeId={selectedNodeId}
              expandedNodeIds={expandedNodeIds}
              onSelect={handleNodeSelection}
              onNextStep={() => onNextStep(false, navigationPath)}
            />
          </motion.div>
        ))}
      </div>
      {/* Pass button */}
      <Button
        onClick={() => onNextStep(true, navigationPath)}
        variant='muted'
        size='lg'
        className='absolute right-6 bottom-6'
      >
        I'm not sure, pass
      </Button>
    </>
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
  onNextStep: (navigationPath: TreeTestClick[]) => void
}) => {
  const hasChildren = item.children && item.children.length > 0
  const isSelected = selectedNodeId === item.id
  const isExpanded = expandedNodeIds.has(item.id)

  const handleSelect = () => {
    onSelect(item.id, parentId)
  }

  return (
    <div>
      <div className='relative my-1 flex items-center'>
        <motion.div
          className={cn(
            'flex w-full cursor-pointer items-center rounded-md bg-white px-2 py-2 shadow-sm transition-colors duration-200 hover:border-gray-300 hover:bg-gray-200',
            isSelected ? 'bg-teal-500 text-white hover:bg-teal-600' : ''
          )}
          onClick={handleSelect}
        >
          {hasChildren && (
            <motion.div
              className='mr-2 flex h-6 w-6 items-center justify-center text-gray-400'
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20
              }}
            >
              <span className={isSelected ? 'text-white' : ''}>
                {isExpanded ? <ChevronDown /> : <ChevronRight />}
              </span>
            </motion.div>
          )}
          {!hasChildren && <div className='mr-2 w-6' />}
          <span>{item.name}</span>
        </motion.div>

        {isSelected && (
          <motion.div
            className='absolute -top-[0px] -right-[162px]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant='teal'
              size='lg'
              onClick={e => {
                e.stopPropagation()
                onNextStep([])
              }}
            >
              I'd find it here
            </Button>
          </motion.div>
        )}
      </div>

      {hasChildren && (
        <motion.div
          className='ml-6 border-l border-gray-200 pl-4'
          animate={{
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{
            height: { duration: 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.2 }
          }}
        >
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
        </motion.div>
      )}
    </div>
  )
}

export default TreeTestView
