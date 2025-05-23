import { NodeTotals } from '@/components/results/node-totals'
import { type EntireTreeTestResult } from '@/types'
import { getNodeNameById } from '@/utils/tree-utils'
import { type TreeItem } from '@/zod-schemas/tree.schema'

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

export default TreeTestResultTabNodeTotals
