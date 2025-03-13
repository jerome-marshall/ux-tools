'use client'
import { type StudyWithTests } from '@/types'
import { treeItemSchema } from '@/zod-schemas/tree.schema'
import { useState } from 'react'
import { z } from 'zod'
import ThanksView from './thanks-view'
import TreeTestView from './tree-test-view'
import WelcomeView from './welcome-view'

const RenderViews = ({ data }: { data: StudyWithTests }) => {
  const tests = data.tests
  const testOrder = data.study.testsOrder

  const steps = ['Welcome', ...testOrder, 'Thanks']

  const [currentStep, setCurrentStep] = useState(steps[0])

  const handleNextStep = () => {
    const currentStepIndex = steps.indexOf(currentStep)
    setCurrentStep(steps[currentStepIndex + 1])
  }

  return (
    <div className='grid h-full bg-gray-100'>
      {currentStep === 'Welcome' && <WelcomeView onNextStep={handleNextStep} />}
      {currentStep !== 'Welcome' &&
        currentStep !== 'Thanks' &&
        (() => {
          const test = tests.find(test => test.testData.id === currentStep)
          if (!test) {
            return (
              <div className='flex h-full items-center justify-center'>
                <h1>Test not found</h1>
              </div>
            )
          }

          if (test.type === 'TREE_TEST') {
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
                taskInstructions={test.taskInstructions!}
                treeStructure={parsedTreeStructure.data}
                onNextStep={handleNextStep}
              />
            )
          }
        })()}
      {currentStep === 'Thanks' && <ThanksView />}
    </div>
  )
}

export default RenderViews
