import React, { useEffect, useState } from 'react'

import { DepositAsset } from '@/types/main'

interface Props {
  selectedAssets: DepositAsset[]
  onCancel: () => void
  onApprove: () => Promise<void>
  onDeposit: () => Promise<void>
  isApproving: boolean
  isDepositing: boolean
  needsApproval: boolean
  error?: string
}

const DepositProcessOverlay: React.FC<Props> = ({
  selectedAssets,
  onCancel,
  onApprove,
  onDeposit,
  isApproving,
  isDepositing,
  needsApproval,
  error,
}) => {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    setCurrentStep(0)
  }, [selectedAssets])

  const steps = [
    {
      id: 'review',
      title: 'Review Assets',
      description: "Review the assets you're about to deposit",
      action: 'Continue to Approval',
      onAction: () => setCurrentStep(1),
    },
    {
      id: 'approve',
      title: 'Approve Assets',
      description: needsApproval
        ? 'Approve the selected assets for deposit'
        : 'Assets are already approved',
      action: needsApproval ? 'Approve Assets' : 'Continue to Deposit',
      onAction: needsApproval ? onApprove : () => setCurrentStep(2),
      status: isApproving ? 'loading' : needsApproval ? 'pending' : 'complete',
    },
    {
      id: 'deposit',
      title: 'Deposit Assets',
      description: 'Deposit your assets to complete the trade',
      action: 'Deposit Assets',
      onAction: onDeposit,
      status: isDepositing ? 'loading' : 'pending',
    },
  ]

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg max-w-xl w-full mx-4'>
        {/* Header */}
        <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Deposit Assets</h3>
            <p className='text-sm text-gray-500'>
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={onCancel}
            className='text-gray-400 hover:text-gray-500 transition-colors'
            disabled={isApproving || isDepositing}
          >
            {/* X icon */}
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className='w-full h-1 bg-gray-100'>
          <div
            className='h-full bg-blue-600 transition-all duration-300'
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Current Step Content */}
          <div className='mb-6'>
            <h4 className='text-lg font-medium mb-2'>{steps[currentStep].title}</h4>
            <p className='text-gray-600'>{steps[currentStep].description}</p>
          </div>

          {/* Selected Assets Preview */}
          <div className='bg-gray-50 rounded-lg p-4 mb-6'>
            <p className='text-sm font-medium mb-3'>
              Selected Assets ({selectedAssets.length})
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {selectedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className='flex items-center bg-white p-2 rounded-lg shadow-sm'
                >
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className='w-10 h-10 rounded-lg mr-3'
                  />
                  <div className='overflow-hidden'>
                    <p className='text-sm font-medium truncate'>{asset.name}</p>
                    <p className='text-xs text-gray-500'>
                      ID: {asset.token_id.substring(0, 6)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Progress */}
          <div className='space-y-4 mb-6'>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index > currentStep ? 'opacity-50' : ''}`}
              >
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center mr-3
                  ${
                    index < currentStep
                      ? 'bg-green-100 text-green-600'
                      : index === currentStep
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                  }
                `}
                >
                  {index < currentStep ? (
                    /* Checkmark icon */
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  ) : index === currentStep && step.status === 'loading' ? (
                    /* Spinner icon */
                    <svg
                      className='w-5 h-5 animate-spin'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    index < currentStep
                      ? 'text-green-600'
                      : index === currentStep
                        ? 'text-blue-600'
                        : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center text-red-600'>
              <svg
                className='w-5 h-5 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span className='text-sm'>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={steps[currentStep].onAction}
            disabled={isApproving || isDepositing}
            className={`
              w-full py-3 px-4 rounded-lg flex items-center justify-center
              ${
                isApproving || isDepositing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
              transition-colors duration-200
            `}
          >
            {isApproving || isDepositing ? (
              <>
                <svg
                  className='w-5 h-5 animate-spin mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                {isApproving ? 'Approving...' : 'Depositing...'}
              </>
            ) : (
              <div className='flex items-center'>
                {steps[currentStep].action}
                <svg
                  className='w-5 h-5 ml-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DepositProcessOverlay
