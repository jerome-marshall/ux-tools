import { PATH } from '@/utils/urls'
import Link from '@/components/link'

export default function Home() {
  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold'>Hello World</h1>
      <Link href={PATH.dashboard}>Go to Dashboard</Link>
    </div>
  )
}
