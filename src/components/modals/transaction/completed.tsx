const CompletedTx = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className='w-full max-w-2xl bg-white rounded-lg shadow-xl'>
      <div className='p-4 border-b border-gray-200'>
        <h2 className='text-lg font-semibold'>Trade Completed!</h2>
      </div>

      <div className='p-4'>
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
          <div className='p-8 flex flex-col items-center'>
            {/* Success checkmark */}
            <div className='mb-6 bg-green-100 rounded-full p-3'>
              <svg
                className='h-12 w-12 text-green-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>

            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              Trade Successfully Completed!
            </h3>
            <p className='text-gray-600 text-center mb-6'>
              All assets have been transferred successfully. You can now view your new assets in
              your wallet.
            </p>

            <button
              onClick={onClose}
              className='w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200'
            >
              Close
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className='bg-green-50 border border-green-100 rounded-lg p-4'>
          <div className='flex items-center text-sm text-green-700'>
            <svg className='h-5 w-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            Transaction has been confirmed on the blockchain
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompletedTx
