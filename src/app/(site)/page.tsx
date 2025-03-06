import { URL } from '@/utils/urls'
import Link from 'next/link'

export default function Home() {
  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold'>Hello World</h1>
      <Link href={URL.dashboard}>Go to Dashboard</Link>
    </div>
  )
}
