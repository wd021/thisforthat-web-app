'use client'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'

const TermsPage: React.FC = () => {
  const isMobile = useIsMobile()

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'} items-center justify-center`}
      >
        <h1>Terms and Conditions</h1>
        <p>Welcome to our Terms and Conditions page.</p>
        <p>Please read these terms and conditions carefully before using our service.</p>
        {/* Add more terms and conditions content here */}
      </div>
      {!isMobile && <Footer />}
    </div>
  )
}

export default TermsPage
