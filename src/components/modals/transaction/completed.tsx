import { Close } from '@/icons'

const CompletedTx = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className='w-full max-w-2xl bg-white rounded-lg shadow-xl h-full'>
      <div className='flex justify-between px-6 pt-6 pb-4 border-b border-gray-100'>
        <div className='flex flex-col'>
          <h2 className='text-xl text-gray-900 font-medium mb-1'>Trade Completed</h2>
        </div>
        <button className='text-gray-500' onClick={onClose}>
          <Close className='w-5 h-5' />
        </button>
      </div>

      <div className='p-4'>
        <div className='bg-white rounded-lg overflow-hidden mb-6'>
          <div className='p-4 flex flex-col items-center'>
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
            <div>NFTs have been sent to your wallet</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompletedTx
