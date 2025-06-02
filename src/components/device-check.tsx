import React from 'react'
import { Laptop } from 'lucide-react'

const DeviceCheck = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className='block lg:hidden'>
        <div className='bg-muted flex min-h-screen flex-col items-center justify-center p-6 text-center'>
          <div className='bg-card max-w-md rounded-2xl p-8 shadow-lg'>
            <Laptop className='text-primary mx-auto mb-6 h-16 w-16' />
            <h2 className='font-helvetica-bold text-foreground mb-4 text-2xl font-semibold'>
              Please check your device
            </h2>
            <p className='font-helvetica-light text-muted-foreground text-lg'>
              This application is designed for larger devices.
              <br />
              Please use a device with a larger screen for the best experience.
            </p>
          </div>
        </div>
      </div>
      <div className='hidden w-full lg:block'>{children}</div>
    </>
  )
}

export default DeviceCheck
