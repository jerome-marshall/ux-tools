const ThanksView = () => {
  return (
    <div className='grid grid-cols-2'>
      <div className='bg-black bg-gradient-to-br from-black via-gray-700 to-white'></div>
      <div className='flex items-center justify-center px-[min(50px,8vw)]'>
        <div className='flex max-w-[500px] flex-col'>
          <h1 className='mb-4 text-2xl font-semibold'>Thank you! 🎉</h1>
          <p className='text-muted-foreground'>
            Thank you for participating in this test.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ThanksView
