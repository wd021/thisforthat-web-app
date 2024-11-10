import { Checkmark, Close } from '@/icons'

const WaitingTx = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className='w-full lg:max-w-2xl bg-white lg:rounded-2xl shadow-xl animate-fadeIn h-full'>
      <div className='flex justify-between px-6 pt-6 pb-4 border-b border-gray-100'>
        <div className='flex flex-col'>
          <h2 className='text-xl text-gray-900 font-medium mb-1'>Deposit Complete</h2>
        </div>
        <button className='text-gray-500' onClick={onClose}>
          <Close className='w-5 h-5' />
        </button>
      </div>
      <div className='px-6 py-12 space-y-8'>
        <div className='flex flex-col items-center text-center'>
          <div className='bg-green-50 p-4 rounded-full mb-6'>
            <Checkmark className='w-12 h-12 text-green-500' />
          </div>

          <div className='space-y-4 max-w-md'>
            <h3 className='text-2xl font-medium text-gray-900'>
              Your NFTs are safely deposited!
            </h3>

            <div className='space-y-2'>
              <p className='text-gray-600'>
                Once the other side deposits their NFTs, it will be transferred automatically to
                your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitingTx
