import GreetingHeader from './_components/greeting-header'
import RecentProjects from './_components/recent-projects'

// This prevents Next.js from trying to prerender this page during build
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className='container'>
      <GreetingHeader />
      <RecentProjects />
    </div>
  )
}
