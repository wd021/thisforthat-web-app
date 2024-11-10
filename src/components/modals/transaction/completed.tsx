import { Checkmark, Close } from '@/icons'

const CompletedTx = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className='w-full lg:max-w-2xl bg-white lg:rounded-xl shadow-xl h-full'>
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
              <Checkmark className='w-10 h-10 text-green-500' />
            </div>
            <div>NFTs have been sent to your wallet</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompletedTx
