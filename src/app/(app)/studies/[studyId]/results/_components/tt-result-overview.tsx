import { ChartColumn } from 'lucide-react'
import { type CategorizedResults } from './tt-result-card'

const TreeTestResultOverview = ({
  correctNodeNames,
  totalResponses,
  categorizedResults
}: {
  correctNodeNames: string
  totalResponses: number
  categorizedResults: CategorizedResults
}) => {
  const directSuccessCount = categorizedResults['direct-success'].length
  const indirectSuccessCount = categorizedResults['indirect-success'].length
  const successCount = directSuccessCount + indirectSuccessCount

  const successRate =
    totalResponses > 0 ? Math.round((successCount / totalResponses) * 100) : 0
  const directness =
    totalResponses > 0 ? Math.round((directSuccessCount / totalResponses) * 100) : 0

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center gap-2'>
        <ChartColumn className='size-4 stroke-3 text-gray-400' />
        <span className='font-medium'>Results</span>
      </div>
      <div className='rounded-lg border p-6'>
        <div className='flex flex-col gap-1'>
          <div className='tt-result-row text-sm font-normal'>
            <p className=''>Nominated correct answer(s)</p>
            <p className=''>Responses</p>
            <p className=''>Success rate</p>
            <p className=''>Directness</p>
          </div>
          <div className='tt-result-row'>
            <p className=''>{correctNodeNames}</p>
            <p className=''>{totalResponses}</p>
            <p className=''>{successRate}%</p>
            <p className=''>{directness}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TreeTestResultOverview
