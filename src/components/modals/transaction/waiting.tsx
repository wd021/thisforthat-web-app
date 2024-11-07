import { Close } from '@/icons'

const WaitingTx = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className='w-full max-w-2xl bg-white rounded-lg shadow-xl animate-fadeIn'>
      <div className='p-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl text-gray-900 font-medium'>Waiting For Deposits</h2>
          <button className='text-gray-500' onClick={onClose}>
            <Close className='w-5 h-5' />
          </button>
        </div>
      </div>
      <div className='px-6 py-12 space-y-6'>
        <div className='flex flex-col items-center'>
          <div className='text-5xl'>🔒</div>
          <h3 className='text-xl font-medium text-gray-900 my-2'>Your NFTs Are Deposited</h3>
          <p className='text-gray-600 text-center max-w-md'>
            Once the counterparty has finished depositing, the trade will automatically execute.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WaitingTx
