import { cn } from '@/lib/utils'
import { type EntireTreeTestResult } from '@/types'
import { getNodeNameById } from '@/utils/tree-utils'
import { type TreeItem } from '@/zod-schemas/tree.schema'
import { CircleCheck, CircleUser } from 'lucide-react'

const TreeTestResultTabNodeTotals = ({
  correctNodeIds,
  entireTestResults,
  treeStructure
}: {
  correctNodeIds: string[]
  entireTestResults: EntireTreeTestResult[]
  treeStructure: TreeItem[]
}) => {
  const totalResults = entireTestResults.length

  const notPassedResults = entireTestResults.filter(
    result => result.treeTestClicks.length > 0 && !result.passed
  )
  const nodeStats = notPassedResults.reduce(
    (acc, result) => {
      const lastNodeId = result.treeTestClicks.at(-1)?.nodeId
      if (!lastNodeId) return acc

      const user = result.testData.userId

      if (acc[lastNodeId]) {
        acc[lastNodeId].frequency++
        acc[lastNodeId].users.add(user)
      } else {
        acc[lastNodeId] = { frequency: 1, users: new Set([user]) }
      }
      return acc
    },
    {} as Record<string, { frequency: number; users: Set<string> }>
  )

  const passedNodes = entireTestResults.filter(result => result.passed)
  const passedNodeStats = passedNodes.reduce(
    (acc, result) => {
      acc.frequency++
      acc.users.add(result.testData.userId)
      return acc
    },
    { frequency: 0, users: new Set<string>() }
  )

  return (
    <div className='flex flex-col gap-4'>
      {Object.entries(nodeStats)
        .sort((a, b) => b[1].frequency - a[1].frequency)
        .map(([nodeId, { frequency, users }]) => {
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
              numUsers={users.size}
            />
          )
        })}
      {passedNodeStats.frequency > 0 && (
        <NodeTotals
          percentage={Math.round((passedNodeStats.frequency / totalResults) * 100)}
          nodeName="I'm not sure, pass"
          correct={false}
          muted
          numUsers={passedNodeStats.users.size}
        />
      )}
    </div>
  )
}

const NodeTotals = ({
  percentage,
  nodeName,
  correct,
  muted,
  numUsers
}: {
  percentage: number
  nodeName: string
  correct: boolean
  muted?: boolean
  numUsers: number
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
            <span>{numUsers}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TreeTestResultTabNodeTotals
