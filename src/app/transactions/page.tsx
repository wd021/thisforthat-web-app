'use client'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'

const TransactionsPage: React.FC = () => {
  const isMobile = useIsMobile()

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'} items-center justify-center`}
      >
        <div>
          <h1>Transactions</h1>
          <p>No transactions available.</p>
        </div>
      </div>
      {!isMobile && <Footer />}
    </div>
  )
}

export default TransactionsPage
