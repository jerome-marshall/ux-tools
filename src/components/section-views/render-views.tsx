'use client'
import { cn } from '@/lib/utils'
import { type StudyWithTests } from '@/types'
import { SECTION_TYPE } from '@/utils/study-utils'
import { studyEditUrl } from '@/utils/urls'
import { treeItemSchema } from '@/zod-schemas/tree.schema'
import { useState } from 'react'
import { z } from 'zod'
import Link from '../link'
import { buttonVariants } from '../ui/button'
import { SurveyView } from './survey/survey-view'
import ThanksView from './thanks-view'
import TreeTestView from './tree-test-view'
import WelcomeView from './welcome-view'

const RenderViews = ({
  data,
  isPreview = false
}: {
  data: StudyWithTests
  isPreview: boolean
}) => {
  const tests = data.tests
  const testOrder = data.study.testsOrder

  const steps = ['Welcome', ...testOrder, 'Thanks']

  const [currentStep, setCurrentStep] = useState(steps[0])

  const handleNextStep = () => {
    const currentStepIndex = steps.indexOf(currentStep)
    setCurrentStep(steps[currentStepIndex + 1])
  }

  return (
    <div className='h-screen bg-gray-100'>
      {isPreview && (
        <div className='absolute top-2 left-2'>
          <Link
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
            href={studyEditUrl(data.study.id)}
          >
            Go to edit
          </Link>
        </div>
      )}
      <div className='h-full overflow-auto'>
        {currentStep === 'Welcome' && <WelcomeView onNextStep={handleNextStep} />}
        {currentStep !== 'Welcome' &&
          currentStep !== 'Thanks' &&
          (() => {
            const test = tests.find(test => {
              return test.testId === currentStep
            })
            if (!test) {
              return (
                <div className='flex h-full items-center justify-center'>
                  <h1>Test not found</h1>
                </div>
              )
            }

            if (test.type === SECTION_TYPE.TREE_TEST) {
              const parsedTreeStructure = z
                .array(treeItemSchema)
                .safeParse(test.treeStructure)

              if (!parsedTreeStructure.success) {
                return (
                  <div className='flex h-full items-center justify-center'>
                    <h1>
                      Uh oh! Something there&apos;s wrong with the test, please contact
                      support.
                    </h1>
                  </div>
                )
              }

              return (
                <TreeTestView
                  taskInstructions={test.taskInstructions}
                  treeStructure={parsedTreeStructure.data}
                  onNextStep={handleNextStep}
                  testId={test.testId}
                  isPreview={!!isPreview}
                />
              )
            }

            if (test.type === SECTION_TYPE.SURVEY) {
              return (
                <SurveyView
                  testData={test}
                  onNextStep={handleNextStep}
                  testId={test.testId}
                  isPreview={!!isPreview}
                />
              )
            }
          })()}
        {currentStep === 'Thanks' && <ThanksView />}
      </div>
    </div>
  )
}

export default RenderViews
