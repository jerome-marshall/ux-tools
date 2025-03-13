import { Button } from '@/components/ui/button'
import React from 'react'

const WelcomeView = ({ onNextStep }: { onNextStep: () => void }) => {
  return (
    <div className='grid grid-cols-2'>
      <div className='bg-black bg-gradient-to-br from-black via-gray-700 to-white'></div>
      <div className='flex items-center justify-center px-[min(50px,8vw)]'>
        <div className='flex max-w-[500px] flex-col'>
          <h1 className='mb-4 text-2xl font-semibold'>Hello there! 👋</h1>
          <p className='text-muted-foreground'>
            You've been invited to participate in a short test.
          </p>
          <p className='text-muted-foreground'>
            It will take less than 5 minutes to complete.
          </p>
          <Button className='mt-8 w-fit' onClick={onNextStep}>
            Start
          </Button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeView
