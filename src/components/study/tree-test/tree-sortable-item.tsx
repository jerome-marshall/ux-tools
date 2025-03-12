import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import Tooltip from '../../custom-tooltip'
import { Button } from '../../ui/button'
import { Checkbox } from '../../ui/checkbox'
import { Input } from '../../ui/input'
import { type TreeItem } from '@/zod-schemas/tree.schema'

interface SortableTreeItemProps {
  id: string
  item: TreeItem
  onAddChild?: (parentId: string) => void
  onUpdateName?: (id: string, newName: string) => void
  onDeleteNode?: (nodeId: string) => void
  onIndent?: (nodeId: string) => void
  onUnindent?: (nodeId: string) => void
  isDragOverlay?: boolean
  draggedNodeId?: string | null
  isFirstChild?: boolean
  isRootLevel?: boolean
  index?: number
  forcedExpanded?: boolean
  onToggleExpand?: (nodeId: string, expanded: boolean) => void
  isCorrect?: boolean
  onToggleCorrect?: (nodeId: string) => void
  getIsCorrect?: (nodeId: string) => boolean
}

export function SortableTreeItem({
  id,
  item,
  onAddChild,
  onUpdateName,
  onDeleteNode,
  onIndent,
  onUnindent,
  isDragOverlay = false,
  draggedNodeId = null,
  isFirstChild = false,
  isRootLevel = false,
  index = 0,
  forcedExpanded = false,
  onToggleExpand,
  isCorrect = false,
  onToggleCorrect,
  getIsCorrect
}: SortableTreeItemProps) {
  // Track the original expanded state
  const [wasExpanded, setWasExpanded] = useState(false)

  // When it's a drag overlay, always show as collapsed
  const [isExpanded, setIsExpanded] = useState(!isDragOverlay && forcedExpanded)
  const [nodeName, setNodeName] = useState(item.name)

  // Track if we're currently restoring state to prevent animation glitches
  const [isRestoring, setIsRestoring] = useState(false)
  // Track if this is a fresh render after a move
  const [isFreshRender, setIsFreshRender] = useState(true)

  // Determine if indent/unindent should be disabled
  const canIndent = !isFirstChild && index > 0
  const canUnindent = !isRootLevel

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      data: {
        type: 'tree-item',
        item
      }
    })

  // After first render, mark this as no longer a fresh render
  useEffect(() => {
    if (isFreshRender) {
      // Use RAF to ensure we're in a stable render cycle
      requestAnimationFrame(() => {
        setIsFreshRender(false)
      })
    }
  }, [isFreshRender])

  // Apply transition only when appropriate
  const style = {
    transform: CSS.Transform.toString(transform),
    // Disable transitions for fresh renders, restoring state, or when dragging is active
    transition: isFreshRender || isRestoring || draggedNodeId ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0
  }

  // Update expanded state when draggedNodeId changes (dragging starts)
  useEffect(() => {
    // If dragging is starting and this node has children
    if (draggedNodeId && item.children.length > 0) {
      // Store the current expanded state before collapsing
      setWasExpanded(isExpanded)

      // Close this node immediately
      setIsExpanded(false)
    }
    // When dragging ends, restore the expanded state with a delay
    else if (!draggedNodeId && wasExpanded) {
      // Mark that we're in restoration mode to disable transitions
      setIsRestoring(true)

      // Use a longer delay for first-level nodes which need more time
      const isFirstLevel = id.startsWith('root') || id === item.id
      const delay = isFirstLevel ? 100 : 50

      // Use setTimeout to delay the restoration to prevent animation glitches
      const timer = setTimeout(() => {
        setIsExpanded(wasExpanded)

        // After restoration is complete, re-enable transitions
        const postTimer = setTimeout(() => {
          setIsRestoring(false)
        }, delay)

        return () => clearTimeout(postTimer)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [draggedNodeId, item.children.length, wasExpanded, id, item.id, isExpanded])

  // Update expanded state when isDragOverlay changes
  useEffect(() => {
    if (isDragOverlay) {
      setIsExpanded(false)
    }
  }, [isDragOverlay])

  // Update expanded state when forcedExpanded changes
  useEffect(() => {
    if (!isDragOverlay) {
      setIsExpanded(forcedExpanded)
    }
  }, [forcedExpanded, isDragOverlay])

  // Update local state when item name changes from props
  useEffect(() => {
    setNodeName(item.name)
  }, [item.name])

  const handleIndent = (e: React.MouseEvent) => {
    // Prevent default behavior and stop propagation
    e.preventDefault()
    e.stopPropagation()

    if (onIndent) {
      onIndent(id)
    }
  }

  const handleUnindent = (e: React.MouseEvent) => {
    // Prevent default behavior and stop propagation
    e.preventDefault()
    e.stopPropagation()

    if (onUnindent) {
      onUnindent(id)
    }
  }

  const handleAddChild = (e: React.MouseEvent) => {
    // Prevent default behavior and stop propagation
    e.preventDefault()
    e.stopPropagation()

    if (onAddChild) {
      onAddChild(id)
    }
  }

  const handleDeleteNode = (e: React.MouseEvent) => {
    // Prevent default behavior and stop propagation
    e.preventDefault()
    e.stopPropagation()

    if (onDeleteNode) {
      onDeleteNode(id)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value)
  }

  const handleNameBlur = () => {
    if (onUpdateName && nodeName.trim() && nodeName !== item.name) {
      onUpdateName(id, nodeName.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onUpdateName && nodeName.trim() && nodeName !== item.name) {
        onUpdateName(id, nodeName.trim())
      }
      ;(e.currentTarget as HTMLInputElement).blur()
    }
  }

  const handleCorrectToggle = (checked: boolean) => {
    if (onToggleCorrect) {
      onToggleCorrect(id)
    }
  }

  // Only render children if expanded and not in a transitional state
  const shouldRenderChildren =
    isExpanded &&
    item.children.length > 0 &&
    !isDragging &&
    !isRestoring &&
    !draggedNodeId

  const hasChildren = item.children.length > 0

  return (
    <div className={`${isDragging ? 'opacity-50' : ''}`}>
      <div ref={setNodeRef} style={style} className='mb-2 flex items-center'>
        <Button
          variant={'ghost'}
          size={'icon'}
          type='button'
          onClick={() => {
            const newExpanded = !isExpanded
            setIsExpanded(newExpanded)
            // Call the onToggleExpand callback if provided
            if (onToggleExpand) {
              onToggleExpand(id, newExpanded)
            }
          }}
          className='mr-2'
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className='size-4' />
            ) : (
              <ChevronRight className='size-4' />
            )
          ) : (
            <span className='w-4' />
          )}
        </Button>

        <div {...attributes} {...listeners} className='mr-2 cursor-grab'>
          <GripVertical className='size-4' />
        </div>

        <div className='relative flex max-w-[260px] flex-1'>
          <Input
            value={nodeName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            className={cn('h-10 bg-white py-0 pr-9', isCorrect ? 'border-green-600' : '')}
            data-node-id={id}
          />

          <Tooltip
            trigger={
              <div className='absolute top-3 right-3 flex items-center'>
                <Checkbox
                  checked={isCorrect}
                  onCheckedChange={handleCorrectToggle}
                  className={cn(
                    isCorrect ? '!border-green-600 !bg-green-600' : '',
                    'size-4 rounded-full border-gray-300'
                  )}
                />
              </div>
            }
            content='Mark as correct answer'
          />
        </div>

        <Tooltip
          trigger={
            <Button
              variant={'ghost'}
              size={'icon'}
              type='button'
              onClick={handleIndent}
              className='ml-2'
              disabled={!canIndent}
            >
              <ArrowRight size={16} className={!canIndent ? 'opacity-50' : ''} />
            </Button>
          }
          content='Indent (make child of previous node)'
        />

        <Tooltip
          trigger={
            <Button
              variant={'ghost'}
              size={'icon'}
              type='button'
              onClick={handleUnindent}
              className='ml-2'
              disabled={!canUnindent}
            >
              <ArrowLeft size={16} className={!canUnindent ? 'opacity-50' : ''} />
            </Button>
          }
          content='Unindent (move up one level)'
        />

        <Tooltip
          trigger={
            <Button
              variant={'ghost'}
              size={'icon'}
              type='button'
              onClick={handleAddChild}
              className='ml-2'
            >
              <Plus size={16} />
            </Button>
          }
          content='Add child node'
        />

        <Tooltip
          trigger={
            <Button
              variant={'ghost'}
              size={'icon'}
              type='button'
              onClick={handleDeleteNode}
              className='ml-2'
            >
              <Trash2 size={16} />
            </Button>
          }
          content='Delete node'
        />
      </div>

      {shouldRenderChildren && (
        <div className='ml-8'>
          {item.children.map((child, childIndex) => (
            <SortableTreeItem
              key={child.id}
              id={child.id}
              item={child}
              onAddChild={onAddChild}
              onUpdateName={onUpdateName}
              onDeleteNode={onDeleteNode}
              onIndent={onIndent}
              onUnindent={onUnindent}
              isDragOverlay={isDragOverlay}
              draggedNodeId={draggedNodeId}
              isFirstChild={childIndex === 0}
              isRootLevel={false}
              index={childIndex}
              forcedExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
              isCorrect={getIsCorrect ? getIsCorrect(child.id) : false}
              onToggleCorrect={onToggleCorrect}
              getIsCorrect={getIsCorrect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
