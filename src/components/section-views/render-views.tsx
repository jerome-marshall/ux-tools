'use client'
import { type StudyWithTests } from '@/types'
import { treeItemSchema } from '@/zod-schemas/tree.schema'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import ThanksView from './thanks-view'
import TreeTestView from './tree-test-view'
import WelcomeView from './welcome-view'
import { useLocalStorage } from 'usehooks-ts'
import { generateId } from '@/lib/utils'

const RenderViews = ({
  data,
  isPreview
}: {
  data: StudyWithTests
  isPreview?: boolean
}) => {
  const [userId, setUserId] = useLocalStorage('user-id', '')

  useEffect(() => {
    if (!isPreview && !userId) {
      setUserId(generateId())
    }
  }, [isPreview, userId, setUserId])

  const tests = data.tests
  const testOrder = data.study.testsOrder

  const steps = ['Welcome', ...testOrder, 'Thanks']

  const [currentStep, setCurrentStep] = useState(steps[1])

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
          const test = tests.find(test => test.sectionData.sectionId === currentStep)
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
                taskInstructions={test.taskInstructions}
                treeStructure={parsedTreeStructure.data}
                onNextStep={handleNextStep}
                testId={test.sectionData.testId}
              />
            )
          }
        })()}
      {currentStep === 'Thanks' && <ThanksView />}
    </div>
  )
}

export default RenderViews
