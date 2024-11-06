const WaitingTx = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <div className='w-full max-w-2xl bg-white rounded-lg shadow-xl'>
      <div className='p-4 border-b border-gray-200'>
        <h2 className='text-lg font-semibold'>Waiting for Other Party</h2>
      </div>

      <div className='p-4'>
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
          <div className='p-8 flex flex-col items-center'>
            {/* Loading animation */}
            <div className='mb-6'>
              <svg className='animate-spin h-12 w-12 text-blue-500' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                  fill='none'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            </div>

            <h3 className='text-xl font-medium text-gray-900 mb-2'>Your Assets Are Secured!</h3>
            <p className='text-gray-600 text-center mb-6'>
              We're now waiting for the other party to complete their deposit. You'll be
              notified once they're done.
            </p>

            <button
              onClick={onCancel}
              className='px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium'
            >
              Cancel Trade
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className='bg-blue-50 border border-blue-100 rounded-lg p-4'>
          <div className='flex items-center text-sm text-blue-700'>
            <svg className='h-5 w-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
            Your assets are safely held in the escrow contract until the trade completes
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitingTx
