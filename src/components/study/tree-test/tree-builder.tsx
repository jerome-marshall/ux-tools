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
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../ui/button'
import { SortableTreeItem } from './tree-sortable-item'

// Define the TreeItem type
export interface TreeItem {
  id: string
  name: string
  children: TreeItem[]
  parentId?: string
}

interface TreeBuilderProps {
  initialItems?: TreeItem[]
  onChange?: (items: TreeItem[]) => void
}

const TreeBuilder = ({ initialItems = [], onChange }: TreeBuilderProps) => {
  const [items, setItems] = useState<TreeItem[]>(initialItems)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Call onChange whenever items change
  useEffect(() => {
    if (onChange) {
      onChange(items)
    }
  }, [items, onChange])

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
    const newId = `item-${Date.now()}`
    const newNode: TreeItem = {
      id: newId,
      name: `New Child ${newId.slice(-4)}`,
      children: []
    }

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

  // Find an item by ID
  const findItemById = (items: TreeItem[], id: string): TreeItem | null => {
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

  // Helper function to check if an item is a descendant of another item
  function isDescendant(parent: TreeItem, childId: string): boolean {
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

  return (
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
        <SortableContext items={allNodeIds} strategy={verticalListSortingStrategy}>
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
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Button
        type='button'
        className='mt-4'
        onClick={() => {
          const newId = `item-${Date.now()}`
          setItems([...items, { id: newId, name: 'New Root Item', children: [] }])
        }}
      >
        <Plus className='size-4' />
        Add node
      </Button>
    </div>
  )
}

export default TreeBuilder
