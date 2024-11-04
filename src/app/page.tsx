'use client'

import { Footer, PWA } from '@/components'
import { Grid } from '@/components/home'
import { useIsMobile } from '@/hooks'

export default function Home() {
  const isMobile = useIsMobile()

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div className={`w-full relative bg-[#f9f9f9] flex ${isMobile ? 'mb-16' : 'mb-[50px]'}`}>
        <Grid />
      </div>
      {!isMobile && <Footer />}
      <PWA />
    </div>
  )
}
