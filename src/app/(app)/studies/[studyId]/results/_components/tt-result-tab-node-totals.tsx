import { cn } from '@/lib/utils'
import { type TreeTestResult } from '@/server/db/schema'
import { getNodeNameById } from '@/utils/tree-utils'
import { type TreeItem } from '@/zod-schemas/tree.schema'
import { CircleCheck, CircleUser } from 'lucide-react'
import React from 'react'

const TreeTestResultTabNodeTotals = ({
  correctNodeIds,
  treeTestResults,
  treeStructure
}: {
  correctNodeIds: string[]
  treeTestResults: TreeTestResult[]
  treeStructure: TreeItem[]
}) => {
  const totalResults = treeTestResults.length
  const lastNodes = treeTestResults
    .filter(result => result.treeTestClicks.length > 0 && !result.passed)
    .map(result => result.treeTestClicks.at(-1)?.nodeId)
    .filter(nodeId => nodeId !== undefined && nodeId !== null)

  const passedCount = treeTestResults.filter(result => result.passed).length

  const nodeFrequencies = lastNodes.reduce(
    (acc, nodeId) => {
      if (acc[nodeId]) {
        acc[nodeId]++
      } else {
        acc[nodeId] = 1
      }

      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className='flex flex-col gap-4'>
      {Object.entries(nodeFrequencies)
        .sort((a, b) => b[1] - a[1])
        .map(([nodeId, frequency]) => {
          const percentage = Math.round((frequency / totalResults) * 100)

          const nodeName = getNodeNameById(treeStructure, nodeId)

          if (!nodeName) {
            return null
          }

          return (
            <NodeTotals
              key={nodeId}
              percentage={percentage}
              nodeName={nodeName}
              correct={correctNodeIds.includes(nodeId)}
            />
          )
        })}
      {passedCount > 0 && (
        <NodeTotals
          percentage={Math.round((passedCount / totalResults) * 100)}
          nodeName="I'm not sure, pass"
          correct={false}
          muted
        />
      )}
    </div>
  )
}

const NodeTotals = ({
  percentage,
  nodeName,
  correct,
  muted
}: {
  percentage: number
  nodeName: string
  correct: boolean
  muted?: boolean
}) => {
  return (
    <div className='relative rounded-sm border p-3'>
      <div
        className='absolute top-0 left-0 h-full bg-gray-200'
        style={{ width: `${percentage}%` }}
      />
      <div className='relative flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <p className={cn(muted && 'text-gray-500')}>{nodeName}</p>
          {correct && <CircleCheck className='size-5 fill-green-600 text-white' />}
        </div>
        <div className='flex items-center gap-6'>
          <p className=''>{percentage}%</p>
          <div className='flex items-center gap-1 text-gray-500'>
            <CircleUser className='size-4' />
            <span>4</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TreeTestResultTabNodeTotals
