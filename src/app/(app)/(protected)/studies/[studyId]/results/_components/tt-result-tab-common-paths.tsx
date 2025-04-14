import { type EntireTreeTestResult, type PathTypeStatus } from '@/types'
import { getNodeNameById, getNodePathTypeStatus, PATH_TYPE } from '@/utils/tree-utils'
import { type TreeItem } from '@/zod-schemas/tree.schema'
import { Clock, UsersRound } from 'lucide-react'

const TreeTestResultTabCommonPaths = ({
  treeStructure,
  entireTestResults,
  correctNodeIds
}: {
  treeStructure: TreeItem[]
  entireTestResults: EntireTreeTestResult[]
  correctNodeIds: string[]
}) => {
  const nonPassedResults = entireTestResults.filter(result => !result.passed)
  const passedResults = entireTestResults.filter(result => result.passed)

  const notPassedCommonPathsData = buildCommonPathsData(
    nonPassedResults,
    treeStructure,
    correctNodeIds
  )
  const passedCommonPathsData = buildCommonPathsData(
    passedResults,
    treeStructure,
    correctNodeIds
  )

  const allCommonPaths = [
    ...Object.entries(notPassedCommonPathsData),
    ...Object.entries(passedCommonPathsData)
  ]
    .map(([path, { pathTypeStatus, count, avgTimeMs }]) => ({
      path,
      pathTypeStatus,
      count,
      avgTimeMs
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className='flex flex-col gap-4'>
      {allCommonPaths.map(({ path, pathTypeStatus, count, avgTimeMs }, index) => (
        <CommonPath
          key={path + index}
          path={path}
          pathType={pathTypeStatus}
          numUsers={count}
          avgTimeMs={avgTimeMs}
        />
      ))}
    </div>
  )
}

const CommonPath = ({
  path,
  pathType,
  numUsers,
  avgTimeMs
}: {
  path: string
  pathType: PathTypeStatus
  numUsers: number
  avgTimeMs: number
}) => {
  const pathTypeStatus = PATH_TYPE[pathType]

  // Round to 1 decimal place for user-friendly display
  const roundedSeconds = Math.round(avgTimeMs / 1000)
  const formattedAvgTimeMs = `${roundedSeconds} seconds`

  return (
    <div className='relative rounded-sm border p-4'>
      <div className='relative flex flex-col gap-3'>
        <div className='flex items-center gap-2'>
          <p className='text-sm text-gray-600'>{path}</p>
        </div>
        <div className='flex items-center justify-between gap-6'>
          <p
            className={`${pathTypeStatus.textColor} ${pathTypeStatus.bgColor} rounded-xs px-1 text-[11px] font-semibold`}
          >
            {pathTypeStatus.label}
          </p>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1 text-gray-500'>
              <Clock className='size-3.5' />
              <span className='text-sm'>Average {formattedAvgTimeMs}</span>
            </div>
            <div className='flex items-center gap-1 text-gray-500'>
              <UsersRound className='size-3.5' />
              <span className='text-sm'>{numUsers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const buildCommonPathsData = (
  results: EntireTreeTestResult[],
  treeStructure: TreeItem[],
  correctNodeIds: string[]
): Record<
  string,
  { pathTypeStatus: PathTypeStatus; count: number; avgTimeMs: number }
> => {
  return results.reduce(
    (acc, result) => {
      const path =
        result.treeTestClicks
          .map(click => getNodeNameById(treeStructure, click.nodeId))
          .join(' > ') || 'Passed'

      const pathTypeStatus = getNodePathTypeStatus(
        result.treeTestClicks,
        treeStructure,
        correctNodeIds,
        result.passed
      )

      const totalTimeMs = result.treeTestClicks.reduce(
        (sum, click) => sum + click.milliseconds,
        0
      )

      const avgTimeForThisResult =
        result.treeTestClicks.length > 0 ? totalTimeMs / result.treeTestClicks.length : 0
      if (acc[path]) {
        const oldCount = acc[path].count
        acc[path].count++
        // ((oldAvg * oldCount) + newValue) / newCount
        const oldAvgTotal = acc[path].avgTimeMs * oldCount
        acc[path].avgTimeMs = (oldAvgTotal + avgTimeForThisResult) / acc[path].count
      } else {
        acc[path] = {
          count: 1,
          pathTypeStatus,
          avgTimeMs: avgTimeForThisResult
        }
      }

      return acc
    },
    {} as Record<
      string,
      { pathTypeStatus: PathTypeStatus; count: number; avgTimeMs: number }
    >
  )
}

export default TreeTestResultTabCommonPaths
