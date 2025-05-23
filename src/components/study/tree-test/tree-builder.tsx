import { Label } from '@/components/ui/label'
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CircleCheck, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../ui/button'
import { SortableTreeItem } from './tree-sortable-item'
import { FormField, FormMessage } from '@/components/ui/form'
import { type UseFormReturn } from 'react-hook-form'
import { type TreeItem, type CorrectPath } from '@/zod-schemas/tree.schema'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { getNodeNameById } from '@/utils/tree-utils'
import { findItemById, getNodePath, isDescendant } from '@/utils/tree-utils'

interface TreeBuilderProps {
  initialItems?: TreeItem[]
  initialCorrectPaths?: CorrectPath[]
  onChange?: (items: TreeItem[], correctPaths: CorrectPath[]) => void
  form: UseFormReturn<StudyWithTestsInsert>
  sectionIndex: number
  disableFields: boolean
}

const TreeBuilder = ({
  initialItems = [],
  initialCorrectPaths = [],
  onChange,
  form,
  sectionIndex,
  disableFields
}: TreeBuilderProps) => {
  const [items, setItems] = useState<TreeItem[]>(initialItems)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newNodeId, setNewNodeId] = useState<string | null>(null)
  // Track expanded node IDs
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  // Track correct paths
  const [correctPaths, setCorrectPaths] = useState<CorrectPath[]>(
    initialCorrectPaths || []
  )

  const isTreeEmpty = items.length === 0

  // Call onChange whenever items or correct paths change
  useEffect(() => {
    if (onChange) {
      onChange(items, correctPaths)
    }

    // Delay the trigger to ensure the tree is fully rendered
    setTimeout(() => {
      void form.trigger(`tests.${sectionIndex}.treeStructure`)
      void form.trigger(`tests.${sectionIndex}.correctPaths`)
    }, 0)
  }, [items, correctPaths, onChange, form, sectionIndex])

  // Expand a node and ensure it's visible
  const expandNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const updated = new Set(prev)
      updated.add(nodeId)
      return updated
    })
  }

  // Focus on the input field when a new node is created
  useEffect(() => {
    if (newNodeId) {
      // Use a longer timeout to ensure DOM has updated, especially for nested nodes
      const timeoutId = setTimeout(() => {
        const input = document.querySelector(`input[data-node-id="${newNodeId}"]`)
        if (input instanceof HTMLInputElement) {
          input.focus()
          // Clear the newNodeId after focus
          setNewNodeId(null)
        } else {
          // If input isn't found immediately, try again with a longer delay
          // This helps with deeply nested nodes that might take longer to render
          const secondTimeoutId = setTimeout(() => {
            const retryInput = document.querySelector(
              `input[data-node-id="${newNodeId}"]`
            )
            if (retryInput instanceof HTMLInputElement) {
              retryInput.focus()
            }
            // Clear the newNodeId regardless
            setNewNodeId(null)
          }, 50)

          return () => clearTimeout(secondTimeoutId)
        }
      }, 10)

      return () => clearTimeout(timeoutId)
    }
  }, [newNodeId])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    setActiveId(active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    // Safety check - if no over target, don't do anything
    if (!over) {
      setActiveId(null)
      return
    }

    // Always clear active ID first with a slight delay to allow for stable rendering
    setTimeout(() => {
      setActiveId(null)
    }, 50)

    if (active.id !== over.id) {
      setItems(prevItems => {
        // Get the dragged item and its path
        const draggedItemPath = findItemPath(prevItems, String(active.id))
        const targetItemPath = findItemPath(prevItems, String(over.id))

        // Safety check - if either path is not found, don't modify the tree
        if (!draggedItemPath.length || !targetItemPath.length) return prevItems

        // Create a deep copy of the items
        const newItems: TreeItem[] = structuredClone(prevItems)

        // Get the dragged item with its subtree
        const draggedItem = getItemAtPath(newItems, draggedItemPath)
        if (!draggedItem) return prevItems

        // Safety check - prevent dropping a parent into its own child
        if (isDescendant(draggedItem, String(over.id))) return prevItems

        // Check if source and target are at the same level
        const areSameLevel = arePathsAtSameLevel(draggedItemPath, targetItemPath)

        // Calculate source index for same-level moves
        let sourceIndex = -1
        let targetIndex = -1

        if (areSameLevel) {
          // Get the last numeric indices from the paths
          sourceIndex = getLastNumericIndex(draggedItemPath)
          targetIndex = getLastNumericIndex(targetItemPath)
        }

        // Remove the dragged item from its original position
        removeItemAtPath(newItems, draggedItemPath)

        // Adjust the target path for special cases
        const adjustedTargetPath = [...targetItemPath]

        // If source and target are at the same level and source index < target index,
        // we need to adjust the target index to account for the removed item
        if (areSameLevel && sourceIndex < targetIndex) {
          const lastIndex = adjustedTargetPath.length - 1
          if (typeof adjustedTargetPath[lastIndex] === 'number') {
            adjustedTargetPath[lastIndex] = adjustedTargetPath[lastIndex] - 1
          }
        }

        // Get position information
        const activeData = active.data.current as { position?: string } | undefined
        const position = activeData?.position ?? 'after'

        // Insert the dragged item at the new position
        return insertItemAtPath(newItems, adjustedTargetPath, draggedItem, position)
      })
    }
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  // Type for path segments
  type PathSegment = number | 'children'
  type Path = PathSegment[]

  // Helper function to find the path to an item in the tree
  function findItemPath(items: TreeItem[], id: string, currentPath: Path = []): Path {
    for (let i = 0; i < items.length; i++) {
      // Check if current item matches
      if (items[i].id === id) {
        return [...currentPath, i]
      }

      // Check in children
      if (items[i].children.length > 0) {
        const childPath = findItemPath(items[i].children, id, [
          ...currentPath,
          i,
          'children'
        ])
        if (childPath.length > 0) {
          return childPath
        }
      }
    }

    return []
  }

  // Helper function to get an item at a specific path
  function getItemAtPath(items: TreeItem[], path: Path): TreeItem | null {
    // Start with the items array
    let current: TreeItem[] | TreeItem = items

    for (const segment of path) {
      if (typeof segment === 'number') {
        if (Array.isArray(current) && current[segment] !== undefined) {
          current = current[segment]
        } else {
          return null
        }
      } else if (
        segment === 'children' &&
        !Array.isArray(current) &&
        'children' in current
      ) {
        current = current.children
      } else {
        return null
      }
    }

    if (!Array.isArray(current)) {
      return structuredClone(current)
    }

    return null
  }

  // Helper function to remove an item at a specific path
  function removeItemAtPath(items: TreeItem[], path: Path): void {
    if (path.length === 0) return

    // Create a reference to the current level
    let current: TreeItem[] | TreeItem = items
    let parent: TreeItem[] | TreeItem = items

    // Navigate to the parent of the item to remove
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i]
      if (typeof segment === 'number') {
        if (Array.isArray(current) && current[segment] !== undefined) {
          parent = current
          current = current[segment]
        } else {
          return
        }
      } else if (
        segment === 'children' &&
        !Array.isArray(current) &&
        'children' in current
      ) {
        parent = current
        current = current.children
      } else {
        return
      }
    }

    // Remove the item
    const lastSegment = path[path.length - 1]
    if (typeof lastSegment === 'number') {
      if (Array.isArray(current)) {
        current.splice(lastSegment, 1)
      } else if (
        Array.isArray(parent) &&
        'children' in parent[path[path.length - 2] as number]
      ) {
        parent[path[path.length - 2] as number].children.splice(lastSegment, 1)
      }
    }
  }

  // Helper function to insert an item at a specific path
  function insertItemAtPath(
    items: TreeItem[],
    path: Path,
    item: TreeItem,
    position = 'after'
  ): TreeItem[] {
    if (path.length === 0) return items

    const newItems: TreeItem[] = structuredClone(items)

    // Special case: inserting at root level
    if (path.length === 1 && typeof path[0] === 'number') {
      const index = path[0]

      if (position === 'before') {
        // Insert before the target item
        newItems.splice(index, 0, item)
      } else {
        // Insert after the target item
        newItems.splice(index + 1, 0, item)
      }
      return newItems
    }

    // Create a reference to the current level
    let current: TreeItem[] | TreeItem = newItems

    // Navigate to the parent of where we want to insert
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i]
      if (typeof segment === 'number') {
        if (Array.isArray(current) && current[segment] !== undefined) {
          current = current[segment]
        } else {
          return items
        }
      } else if (
        segment === 'children' &&
        !Array.isArray(current) &&
        'children' in current
      ) {
        current = current.children
      } else {
        return items
      }
    }

    // Insert the item
    const lastSegment = path[path.length - 1]
    const secondLastSegment = path[path.length - 2]

    if (
      secondLastSegment === 'children' &&
      typeof lastSegment === 'number' &&
      Array.isArray(current)
    ) {
      // We're inserting into a children array
      if (position === 'before') {
        // Insert before the target item
        current.splice(lastSegment, 0, item)
      } else {
        // Insert after the target item
        current.splice(lastSegment + 1, 0, item)
      }
    } else if (
      !Array.isArray(current) &&
      'children' in current &&
      lastSegment === 'children'
    ) {
      // We're adding as the first child
      current.children.unshift(item)
    } else if (typeof lastSegment === 'number' && Array.isArray(current)) {
      // We're inserting as a sibling
      if (position === 'before') {
        // Insert before the target item
        current.splice(lastSegment, 0, item)
      } else {
        // Insert after the target item
        current.splice(lastSegment + 1, 0, item)
      }
    }

    return newItems
  }

  // Function to add a child node to a specific parent
  const addChildNode = (parentId: string) => {
    const newId = `node-${Date.now()}`
    const newNode: TreeItem = {
      id: newId,
      name: '',
      children: []
    }

    // Ensure the parent node is expanded
    expandNode(parentId)

    // Create a deep copy of the items array and add the new node
    setItems(prevItems => {
      // Helper function to recursively find and update the parent node
      const addChildToParent = (items: TreeItem[], parentId: string): TreeItem[] => {
        return items.map(item => {
          if (item.id === parentId) {
            // Found the parent, add the new child
            return {
              ...item,
              children: [...item.children, newNode]
            }
          } else if (item.children.length > 0) {
            // Check children recursively
            return {
              ...item,
              children: addChildToParent(item.children, parentId)
            }
          }
          // No match, return unchanged
          return item
        })
      }

      return addChildToParent(prevItems, parentId)
    })

    // Set the new node ID to trigger focus
    setNewNodeId(newId)
  }

  // Function to update a node's name
  const updateNodeName = (nodeId: string, newName: string) => {
    setItems(prevItems => {
      // Helper function to recursively find and update the node
      const updateNodeInTree = (
        items: TreeItem[],
        nodeId: string,
        newName: string
      ): TreeItem[] => {
        return items.map(item => {
          if (item.id === nodeId) {
            // Found the node, update its name
            return {
              ...item,
              name: newName
            }
          } else if (item.children.length > 0) {
            // Check children recursively
            return {
              ...item,
              children: updateNodeInTree(item.children, nodeId, newName)
            }
          }
          // No match, return unchanged
          return item
        })
      }

      return updateNodeInTree(prevItems, nodeId, newName)
    })
  }

  // Get all node IDs for the SortableContext
  const getAllNodeIds = (items: TreeItem[]): string[] => {
    const ids: string[] = []

    const collectIds = (nodes: TreeItem[]) => {
      for (const node of nodes) {
        ids.push(node.id)
        if (node.children.length > 0) {
          collectIds(node.children)
        }
      }
    }

    collectIds(items)
    return ids
  }

  // All node IDs for the SortableContext
  const allNodeIds = getAllNodeIds(items)

  // Custom drop animation
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  // Improve collision detection with a more forgiving algorithm
  const collisionDetectionStrategy: CollisionDetection = args => {
    // First try the standard algorithm
    const pointerCollisions = closestCenter(args)

    // If we have collisions, use them
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }

    // If no collisions and we're dragging something, find the closest item
    // This prevents items from being "lost" during drag
    if (activeId) {
      // Find all droppable elements
      const droppableElements = args.droppableContainers
        .filter(container => container.id !== activeId)
        .map(container => container.id as string)

      // If we have a previous over target, prioritize it
      const activeData = args.active.data.current as { lastOverId?: string } | undefined
      if (activeData?.lastOverId && droppableElements.includes(activeData.lastOverId)) {
        return [{ id: activeData.lastOverId }]
      }

      // Otherwise, return the first root node as a fallback
      if (droppableElements.length > 0) {
        return [{ id: droppableElements[0] }]
      }
    }

    return []
  }

  // Track the last over target and handle special positioning
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event

    if (over) {
      // Store the last over target
      const activeData = active.data.current as Record<string, unknown> | undefined
      if (activeData) {
        active.data.current = {
          ...activeData,
          lastOverId: over.id
        }
      } else {
        active.data.current = { lastOverId: over.id }
      }
    }
  }

  // Add a custom modifier to handle the position of the dragged item
  function handleDragMove(event: DragMoveEvent) {
    const { active, over, delta } = event

    if (over) {
      // Determine position based on mouse position relative to the target
      let position = 'after' // Default to after

      // Simple approach - use the delta y to determine direction
      // If delta y is negative, we're moving up (before), otherwise after
      if (delta.y < 0) {
        position = 'before'
      } else if (delta.y > 0) {
        position = 'after'
      } else {
        // If no vertical movement, use horizontal position
        // Moving left = before, moving right = after
        position = delta.x < 0 ? 'before' : 'after'
      }

      // Store the position information
      const activeData = active.data.current as Record<string, unknown> | undefined
      if (activeData) {
        active.data.current = {
          ...activeData,
          position,
          lastOverId: over.id
        }
      } else {
        active.data.current = { position, lastOverId: over.id }
      }
    }
  }

  // Create a collapsed version of a tree item for the drag overlay
  function createCollapsedItem(item: TreeItem): TreeItem {
    return {
      ...item,
      children:
        item.children.length > 0 ? [{ id: 'placeholder', name: '...', children: [] }] : []
    }
  }

  // Function to delete a node and all its children
  const deleteNode = (nodeId: string) => {
    // First collect all IDs that will be deleted (node + all children)
    const collectNodeIds = (items: TreeItem[], targetId: string): string[] => {
      const ids: string[] = []

      const collectIds = (node: TreeItem): void => {
        ids.push(node.id)
        node.children.forEach(collectIds)
      }

      const findAndCollect = (items: TreeItem[], targetId: string): boolean => {
        for (const item of items) {
          if (item.id === targetId) {
            collectIds(item)
            return true
          }

          if (item.children.length > 0 && findAndCollect(item.children, targetId)) {
            return true
          }
        }
        return false
      }

      findAndCollect(items, targetId)
      return ids
    }

    // Get all node IDs that will be deleted
    const nodeIdsToDelete = collectNodeIds(items, nodeId)

    // Update the items tree
    setItems(prevItems => {
      // Helper function to recursively filter out the node and its children
      const filterNode = (items: TreeItem[], nodeId: string): TreeItem[] => {
        // Filter out the node with the given ID
        return items
          .filter(item => item.id !== nodeId)
          .map(item => ({
            ...item,
            // Recursively filter children
            children: filterNode(item.children, nodeId)
          }))
      }

      return filterNode(prevItems, nodeId)
    })

    // Update correct paths - remove any paths that include deleted nodes
    setCorrectPaths(prevPaths => {
      return prevPaths.filter(correctPath => {
        // Check if this path contains the deleted node or any of its children
        const containsDeletedNode = correctPath.path.some(pathNodeId =>
          nodeIdsToDelete.includes(pathNodeId)
        )

        // Keep paths that don't contain any deleted nodes
        return !containsDeletedNode
      })
    })
  }

  // Helper function to check if two paths are at the same level
  function arePathsAtSameLevel(path1: Path, path2: Path): boolean {
    if (path1.length !== path2.length) return false

    // Check all segments except the last one
    for (let i = 0; i < path1.length - 1; i++) {
      if (path1[i] !== path2[i]) return false
    }

    return true
  }

  // Helper function to get the last numeric index from a path
  function getLastNumericIndex(path: Path): number {
    for (let i = path.length - 1; i >= 0; i--) {
      if (typeof path[i] === 'number') {
        return path[i] as number
      }
    }
    return -1
  }

  // Function to indent a node (make it a child of the previous sibling)
  const indentNode = (nodeId: string) => {
    setItems(prevItems => {
      // Find the path to the node
      const nodePath = findItemPath(prevItems, nodeId)
      if (nodePath.length === 0) return prevItems

      // Get the last index and parent path
      const parentPath = nodePath.slice(0, -1)
      const lastSegment = nodePath[nodePath.length - 1]

      // Can only indent if it's not the first item and last segment is a number
      if (typeof lastSegment !== 'number' || lastSegment === 0) {
        return prevItems
      }

      // Create a deep copy
      const newItems = structuredClone(prevItems)

      // Get the current parent array
      let parentArray: TreeItem[] = newItems
      if (parentPath.length > 0) {
        let currentLevel: TreeItem[] | TreeItem = newItems
        for (const segment of parentPath) {
          if (currentLevel === null) return prevItems

          if (typeof segment === 'number') {
            if (Array.isArray(currentLevel) && currentLevel[segment] !== undefined) {
              currentLevel = currentLevel[segment]
            } else {
              return prevItems
            }
          } else if (
            segment === 'children' &&
            !Array.isArray(currentLevel) &&
            'children' in currentLevel
          ) {
            currentLevel = currentLevel.children
          } else {
            return prevItems
          }
        }

        if (!Array.isArray(currentLevel)) return prevItems
        parentArray = currentLevel
      }

      // Get the node to indent and the previous sibling
      const nodeToIndent = parentArray[lastSegment]
      const previousSibling = parentArray[lastSegment - 1]

      // Remove the node from its current position
      parentArray.splice(lastSegment, 1)

      // Add it as a child of the previous sibling
      previousSibling.children.push(nodeToIndent)

      return newItems
    })
  }

  // Function to unindent a node (move it to be a sibling of its parent)
  const unindentNode = (nodeId: string) => {
    setItems(prevItems => {
      // Create a deep copy to work with
      const newItems = structuredClone(prevItems)

      // Map of node IDs to their parent IDs for the entire tree
      const parentMap = new Map<string, string>()

      // Find parent relationships for all nodes
      const buildParentMap = (items: TreeItem[], parentId?: string) => {
        for (const item of items) {
          if (parentId) {
            parentMap.set(item.id, parentId)
          }

          if (item.children.length > 0) {
            buildParentMap(item.children, item.id)
          }
        }
      }

      buildParentMap(newItems)

      // First, check if the node has a parent
      const parentId = parentMap.get(nodeId)
      if (!parentId) {
        // This is a root node or doesn't exist - can't unindent
        return prevItems
      }

      // Find the grandparent (parent's parent)
      const grandparentId = parentMap.get(parentId)
      if (!grandparentId) {
        // Parent is a root node - we'll move to root level

        // Find the node to move
        let nodeToMove: TreeItem | undefined

        // Find parent's index in root array
        let parentIndex = -1

        for (let i = 0; i < newItems.length; i++) {
          if (newItems[i].id === parentId) {
            parentIndex = i

            // Find and remove the node from parent's children
            newItems[i].children = newItems[i].children.filter(child => {
              if (child.id === nodeId) {
                nodeToMove = child
                return false
              }
              return true
            })

            break
          }
        }

        if (nodeToMove && parentIndex >= 0) {
          // Insert node after its parent at root level
          newItems.splice(parentIndex + 1, 0, nodeToMove)
        }
      } else {
        // We have a grandparent - move node to be a child of grandparent, after parent

        // Helper function to find nodes
        const findNodes = (items: TreeItem[], target: string): TreeItem | undefined => {
          for (const item of items) {
            if (item.id === target) {
              return item
            }

            if (item.children.length > 0) {
              const found = findNodes(item.children, target)
              if (found) return found
            }
          }

          return undefined
        }

        // Find the node, its parent, and grandparent
        let nodeToMove: TreeItem | undefined
        const grandparentNode = findNodes(newItems, grandparentId)
        const parentNode = findNodes(newItems, parentId)

        if (parentNode) {
          // Find and remove the node from parent's children
          parentNode.children = parentNode.children.filter(child => {
            if (child.id === nodeId) {
              nodeToMove = child
              return false
            }
            return true
          })
        }

        if (nodeToMove && grandparentNode) {
          // Find parent's index in grandparent's children
          let parentIndex = -1

          for (let i = 0; i < grandparentNode.children.length; i++) {
            if (grandparentNode.children[i].id === parentId) {
              parentIndex = i
              break
            }
          }

          if (parentIndex >= 0) {
            // Insert node after its parent in grandparent's children
            grandparentNode.children.splice(parentIndex + 1, 0, nodeToMove)
          }
        }
      }

      return newItems
    })
  }

  // Helper function to check if a node is at the root level
  const isRootNode = (nodeId: string, items: TreeItem[]): boolean => {
    return items.some(item => item.id === nodeId)
  }

  // Toggle whether a node path is marked as correct
  const toggleCorrectPath = (nodeId: string) => {
    const nodePath = getNodePath(items, nodeId)

    setCorrectPaths(prevPaths => {
      // Check if this path is already marked correct
      const existingIndex = prevPaths.findIndex(p => p.id === nodeId)

      if (existingIndex >= 0) {
        // Remove it from correct paths
        return prevPaths.filter(p => p.id !== nodeId)
      } else {
        // Add it to correct paths
        return [...prevPaths, { id: nodeId, path: nodePath }]
      }
    })
  }

  // Check if a node is marked as a correct path
  const isCorrectPath = (nodeId: string): boolean => {
    return correctPaths.some(p => p.id === nodeId)
  }

  const AddNodeButton = ({
    className,
    disabled
  }: {
    className?: string
    disabled?: boolean
  }) => (
    <Button
      type='button'
      size={'sm'}
      className={className}
      onClick={() => {
        const newId = `node-${Date.now()}`
        setItems([...items, { id: newId, name: '', children: [] }])
        // Set the new node ID to trigger focus
        setNewNodeId(newId)
      }}
      disabled={disabled}
    >
      <Plus className='size-4' />
      Add node
    </Button>
  )

  return (
    <div>
      <FormField
        control={form.control}
        name={`tests.${sectionIndex}.treeStructure`}
        render={({ field }) => (
          <>
            <FormMessage className='mb-2' />
            <div className='rounded-md bg-gray-50 p-4' ref={field.ref}>
              {isTreeEmpty ? (
                <div className='flex flex-col items-center justify-center'>
                  <p className='text-sm text-gray-500'>
                    Create your tree by adding a node or import the data from a CSV file
                  </p>
                  <div className='mt-4 flex gap-2'>
                    <AddNodeButton />
                    <Button
                      variant={'outline'}
                      size={'sm'}
                      type='button'
                      disabled={disableFields}
                    >
                      Import from CSV
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={collisionDetectionStrategy}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                  >
                    <SortableContext
                      items={allNodeIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {items.map((item, index) => (
                        <SortableTreeItem
                          key={item.id}
                          id={item.id}
                          item={item}
                          onAddChild={addChildNode}
                          onUpdateName={updateNodeName}
                          onDeleteNode={deleteNode}
                          onIndent={indentNode}
                          onUnindent={unindentNode}
                          isFirstChild={index === 0}
                          isRootLevel={true}
                          index={index}
                          forcedExpanded={expandedNodes.has(item.id)}
                          onToggleExpand={(nodeId, expanded) => {
                            if (expanded) {
                              expandNode(nodeId)
                            } else {
                              setExpandedNodes(prev => {
                                const updated = new Set(prev)
                                updated.delete(nodeId)
                                return updated
                              })
                            }
                          }}
                          draggedNodeId={activeId}
                          isCorrect={isCorrectPath(item.id)}
                          onToggleCorrect={toggleCorrectPath}
                          getIsCorrect={isCorrectPath}
                          disabled={disableFields}
                        />
                      ))}
                    </SortableContext>

                    <DragOverlay dropAnimation={dropAnimation}>
                      {activeId ? (
                        <SortableTreeItem
                          id={activeId}
                          item={createCollapsedItem(
                            findItemById(items, activeId) ?? {
                              id: activeId,
                              name: '',
                              children: []
                            }
                          )}
                          onAddChild={addChildNode}
                          onUpdateName={updateNodeName}
                          onDeleteNode={deleteNode}
                          onIndent={indentNode}
                          onUnindent={unindentNode}
                          isDragOverlay={true}
                          isRootLevel={isRootNode(activeId, items)}
                          forcedExpanded={false}
                          onToggleExpand={(nodeId, expanded) => {
                            if (expanded) {
                              expandNode(nodeId)
                            } else {
                              setExpandedNodes(prev => {
                                const updated = new Set(prev)
                                updated.delete(nodeId)
                                return updated
                              })
                            }
                          }}
                          isCorrect={isCorrectPath(activeId)}
                          onToggleCorrect={toggleCorrectPath}
                          getIsCorrect={isCorrectPath}
                          disabled={disableFields}
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                  <AddNodeButton className='mt-4' disabled={disableFields} />
                </div>
              )}
            </div>
          </>
        )}
      />
      <div className='mt-6'>
        <Label>Correct answers</Label>
        <FormField
          control={form.control}
          name={`tests.${sectionIndex}.correctPaths`}
          render={({ field }) => (
            <div className='mt-3' ref={field.ref}>
              <FormMessage className='mx-auto' />

              {correctPaths?.length > 0 ? (
                correctPaths.map(path => (
                  <div key={path.id} className='flex items-center gap-2 py-1'>
                    <CircleCheck className='size-5 rounded-full fill-green-600 text-white' />
                    <span>
                      {path.path
                        .map(nodeId => getNodeNameById(items, nodeId))
                        .join(' › ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className='flex flex-col items-center justify-center'>
                  <p className='mx-auto w-fit text-sm text-gray-500'>
                    Select at least one node from your tree
                  </p>
                </div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default TreeBuilder
