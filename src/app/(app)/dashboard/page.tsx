import RecentProjects from './_components/recent-projects'

// This prevents Next.js from trying to prerender this page during build
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className='container'>
      <h1 className='mt-4 mb-8 text-[32px] font-medium'>Afternoon, Jerome</h1>
      <RecentProjects />
    </div>
  )
}
