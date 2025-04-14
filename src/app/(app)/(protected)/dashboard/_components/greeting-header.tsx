'use client'
import { authClient } from '@/lib/auth-client'
import React from 'react'

const GreetingHeader = () => {
  const { data: session } = authClient.useSession()

  const hour = new Date().getHours()

  let text = 'Evening'
  if (hour >= 4 && hour < 12) text = 'Morning'
  else if (hour >= 12 && hour < 17) text = 'Afternoon'

  return (
    <h1 className='mt-4 mb-8 text-[32px] font-medium'>
      {text},{' '}
      {session?.user?.name
        ? session.user.name.split(' ')[0] || session.user.name
        : 'User'}
    </h1>
  )
}

export default GreetingHeader
