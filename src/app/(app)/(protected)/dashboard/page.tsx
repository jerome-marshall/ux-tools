import GreetingHeader from './_components/greeting-header'
import RecentProjects from './_components/recent-projects'

export default function Home() {
  return (
    <div className='container'>
      <GreetingHeader />
      <RecentProjects />
    </div>
  )
}
