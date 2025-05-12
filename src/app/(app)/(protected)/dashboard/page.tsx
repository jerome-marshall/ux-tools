import GreetingHeader from './_components/greeting-header'
import RecentProjects from './_components/recent-projects'
import { AllStudies } from './_components/all-studies'

export default function Home() {
  return (
    <div className='container'>
      <GreetingHeader />
      <RecentProjects />
      <AllStudies />
    </div>
  )
}
