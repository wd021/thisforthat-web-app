'use client'

import React from 'react'
import Link from 'next/link'

import { Footer } from '@/components'
import { useIsMobile } from '@/hooks'
import { DISCORD_LINK, GITHUB_LINK } from '@/utils/constants'

const FeatureCard = ({
  emoji,
  title,
  description,
}: {
  emoji: string
  title: string
  description: string
}) => (
  <div className='w-full mb-6 bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow'>
    <div className='flex items-start space-x-4'>
      <div className='w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg text-xl'>
        {emoji}
      </div>
      <div>
        <h3 className='font-semibold text-lg mb-2'>{title}</h3>
        <p className='text-gray-600'>{description}</p>
      </div>
    </div>
  </div>
)

const SupportedChain = ({ name }: { name: string }) => (
  <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2'>
    {name}
  </span>
)

const AboutPage = () => {
  const isMobile = useIsMobile()
  const supportedChains = ['Ethereum', 'Base', 'Polygon', 'Optimism', 'Arbitrum']

  return (
    <div className='absolute top-[75px] bottom-0 w-full flex'>
      <div
        className={`w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar ${!isMobile && 'mb-[50px]'}`}
      >
        <div className='max-w-[800px] px-6 mx-auto py-12'>
          {/* Hero Section */}
          <div className='text-center mb-12'>
            <img
              src='/about.webp'
              alt='TFT Platform'
              className='rounded-lg shadow-lg mb-8 w-full max-w-[525px] mx-auto'
            />
            <h1 className='text-2xl font-bold mb-2'>THIS FOR THAT</h1>
            <p className='text-xl text-gray-600'>
              Trade, explore, and connect in the world of NFTs.
            </p>
          </div>

          {/* How It Works Section */}
          <div className='mb-12'>
            <h2 className='text-2xl font-semibold mb-6'>How It Works</h2>
            <div className='space-y-4'>
              <FeatureCard
                emoji='🖼️'
                title='Discover NFTs'
                description='Browse through NFTs of other users in the NFT tab.'
              />
              <FeatureCard
                emoji='🤝'
                title='Make Offers'
                description='Found something you like? Make an offer and negotiate with the owner.'
              />
              <FeatureCard
                emoji='⛓️'
                title='Complete Trades'
                description='Once terms are agreed upon, NFTs are safely transferred via smart contracts.'
              />
            </div>
          </div>

          {/* Supported Chains Section */}
          <div className='mb-12'>
            <h2 className='text-2xl font-semibold mb-4'>Supported Chains</h2>
            <div className='mb-4'>
              {supportedChains.map((chain) => (
                <SupportedChain key={chain} name={chain} />
              ))}
            </div>
            <p className='text-gray-600 mb-4'>
              Currently, you can only swap for NFTs on the same chain. We&apos;re working on
              cross-chain swapping.
            </p>
          </div>

          {/* Technical Details Section */}
          <div className='mb-12 bg-white rounded-lg p-6 shadow-sm'>
            <h2 className='text-2xl font-semibold mb-6'>Technical Details</h2>
            <p className='text-gray-600 mb-4'>
              All trades are executed automatically through smart contracts. Our contracts are
              open-sourced and available on GitHub for complete transparency.
            </p>
            <Link
              href={GITHUB_LINK}
              target='_blank'
              className='text-blue-600 hover:text-blue-800 underline'
            >
              View on GitHub
            </Link>
          </div>

          {/* Community Section */}
          <div className='text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 shadow-sm'>
            <h2 className='text-2xl font-semibold mb-4'>Join Our Community</h2>
            <p className='text-gray-600 mb-6'>
              Stay up-to-date with the latest features and updates by joining our Discord.
            </p>
            <Link
              href={DISCORD_LINK}
              target='_blank'
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Join Discord
            </Link>
          </div>
        </div>
      </div>
      {!isMobile && <Footer />}
    </div>
  )
}

export default AboutPage
