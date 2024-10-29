'use client'

import { useState } from 'react'

import { Footer, PWA } from '@/components'
import { ActivityFeed, Grid } from '@/components/home'
import { Offer } from '@/components/modals'
import { useIsMobile } from '@/hooks'
import { Activity, Image as ImageIcon } from '@/icons'
import { NFTFeedItem as NFTFeedItemType, SimplifiedOfferItem } from '@/types/supabase'

type Tab = 'grid' | 'feed'

const ContentArea: React.FC<{
  activeTab: Tab
  isMobile: boolean
  setMakeOfferItem: (item: NFTFeedItemType) => void
  setViewOfferItem: (item: SimplifiedOfferItem) => void
}> = ({ activeTab, isMobile, setMakeOfferItem, setViewOfferItem }) => (
  <>
    {(!isMobile || activeTab === 'grid') && (
      <Grid setMakeOfferItem={setMakeOfferItem} setViewOfferItem={setViewOfferItem} />
    )}
    {/* {(!isMobile || activeTab === 'feed') && (
      <ActivityFeed showCollapsibleTab={!isMobile} setViewOfferItem={setViewOfferItem} />
    )} */}
  </>
)

const MobileFooter: React.FC<{
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}> = ({ activeTab, setActiveTab }) => (
  <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16'>
    <MobileFooterTab
      isActive={activeTab === 'grid'}
      onClick={() => setActiveTab('grid')}
      icon={<ImageIcon className='w-5 h-5' />}
      label='Browse NFTs'
    />
    <MobileFooterTab
      isActive={activeTab === 'feed'}
      onClick={() => setActiveTab('feed')}
      icon={<Activity className='w-5 h-5' />}
      label='Latest Activity'
    />
  </div>
)

const MobileFooterTab: React.FC<{
  isActive: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}> = ({ isActive, onClick, icon, label }) => (
  <button
    className={`flex-1 h-full flex flex-col items-center justify-center space-y-1 ${
      isActive ? 'bg-gray-100 font-semibold' : 'bg-white font-medium'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className='text-sm font-medium'>{label}</span>
  </button>
)

export default function Home() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<Tab>('grid')

  const [makeOfferItem, setMakeOfferItem] = useState<NFTFeedItemType | null>(null)
  const [viewOfferItem, setViewOfferItem] = useState<SimplifiedOfferItem | null>(null)

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div className={`w-full relative bg-[#f9f9f9] flex ${isMobile ? 'mb-16' : 'mb-[50px]'}`}>
        <ContentArea
          activeTab={activeTab}
          isMobile={isMobile}
          setMakeOfferItem={setMakeOfferItem}
          setViewOfferItem={setViewOfferItem}
        />
      </div>
      {isMobile ? (
        <MobileFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <Footer />
      )}
      {makeOfferItem && (
        <Offer
          type='make_offer'
          offerId={null}
          initialNFT={makeOfferItem}
          closeModal={() => setMakeOfferItem(null)}
        />
      )}
      {viewOfferItem && (
        <Offer
          type={
            viewOfferItem.status === 'accepted' || viewOfferItem.status === 'completed'
              ? 'transaction'
              : 'view_offer'
          }
          offerId={viewOfferItem.id}
          initialNFT={null}
          closeModal={() => setViewOfferItem(null)}
        />
      )}
      <PWA />
    </div>
  )
}
