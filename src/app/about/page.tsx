'use client'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'

const AboutPage: React.FC = () => {
  const isMobile = useIsMobile()

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'} items-center justify-center`}
      >
        <div className='max-w-[620px] px-6 mx-auto flex flex-col items-center '>
          <img src='/about.webp' alt='about' />
          <div className='my-8'>
            TFT is a place for swapping NFTs. Discover NFTS, meet and connect with fellow NFT
            owners and collectors, and trade NFTs with ease. It's very simple. You discover NFTS
            in the 🖼️ tab. When you find something you like, you make an offer with 🤝. When 2
            parties are done negotiating and agree on the terms, it moves to the ⛓️ tab. this is
            where your NFTs get traded onchain and moved in your wallets!
          </div>
          <div>
            We currently support Ethereum, Base, Optimism, Arbitrum, Zksync. More chains to
            come!
          </div>
          <div>
            Currently, you can only trade with other NFTs on the same chain. Cross chain
            swapping is coming!
          </div>
          <div>Trades are executed automatically via smart contracts.</div>
          <div>Join our Discord to keep up-to-date with everything.</div>
        </div>
      </div>
      {!isMobile && <Footer />}
    </div>
  )
}

export default AboutPage
